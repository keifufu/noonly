import { createMediaQuery } from '@solid-primitives/media';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import StarterKit from '@tiptap/starter-kit';
import { Toolbar } from 'solid-headless';
import { createEffect, createSignal, For, onMount, Show } from 'solid-js';
import { createTiptapEditor } from 'solid-tiptap';
import Input from './Input';
import Toast from './Toast';
import ToolbarContents from './ToolbarContents';

// TODO: better editor features (also fix broken ones, or remove them)

function App() {
  const [auth] = createSignal(localStorage.getItem('jwtToken') || null)
  const [addresses, setAddresses] = createSignal([])
  const [isLoading, setLoading] = createSignal(false)
  const [isSubmitting, setSubmitting] = createSignal(false)
  const isMobile = createMediaQuery('(max-width: 768px)');
  const [selectedAddress, setSelectedAddress] = createSignal(localStorage.getItem('last-address-id'))
  const [to, setTo] = createSignal('')
  const [cc, setCc] = createSignal('')
  const [bcc, setBcc] = createSignal('')
  const [subject, setSubject] = createSignal('')
  const [attachments, setAttachments] = createSignal([])
  const [toast, setToast] = createSignal(null)

  const [container, setContainer] = createSignal()
  const [menu, setMenu] = createSignal()
  const editor = createTiptapEditor(() => ({
    element: container(),
    extensions: [
      StarterKit,
      BubbleMenu.configure({
        element: menu()
      })
    ],
    editorProps: {
      attributes: {
        class: 'text-base font-normal rounded p-6 focus:border-blue-600 focus:outline-none prose max-w-full h-full bg-slate-800 text-gray-100 focus:text-gray-200 focus:bg-opacity-75 transition ease-in-out bg-clip-padding border border-solid border-gray-500',
      },
    },
    content: ''
  }))

  let toastTimeout = null
  const showToast = (message, type, button, timeout) => {
    clearTimeout(toastTimeout)
    setToast(null)
    setToast({ message, type, button })
    toastTimeout = setTimeout(() => setToast(null), timeout || 3000)
  }

  createEffect(() => {
    if (!auth())
      window.location.href = 'https://noonly.net/login'
  })

  onMount(() => {
    setLoading(true)
    fetch('https://oldapi.noonly.net/smtp/get-addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: auth(),
      })
    }).then((res) => res.json()).then((res) => {
      if (res.success)
        setAddresses(res.addresses.sort((a, b) => a.order - b.order))
      else
        showToast('Failed to fetch addresses', 'error')
      setLoading(false)
    }).catch((e) => {
      showToast('Failed to fetch addresses', 'error')
    })
  })

  let timeout = null
  const send = () => {
    const MAIL_TIMEOUT=10000
    setSubmitting(true)
    showToast('Sending mail in 10s...', 'success', { name: 'Cancel', onClick: () => {
      clearTimeout(timeout)
      setSubmitting(false)
      showToast('Mail sending cancelled', 'success')
    } }, MAIL_TIMEOUT)
    timeout = setTimeout(() => actuallySend(), MAIL_TIMEOUT)
  }

  const actuallySend = () => {
    const text = editor().getText()
    const html = editor().getHTML()
    const formData = new FormData()
    attachments().forEach((e) => formData.append('attachments', e))
    formData.append('fromAddressId', selectedAddress())
    formData.append('to', to())
    formData.append('cc', cc())
    formData.append('bcc', bcc())
    formData.append('subject', subject())
    formData.append('text', text)
    formData.append('html', html)
    fetch('https://oldapi.noonly.net/smtp/send', {
      method: 'POST',
      headers: {
        Authorization: auth(),
      },
      body: formData
    }).then((res) => res.json()).then((res) => {
      if (res.success)
        showToast('Mail sent', 'success')
      else
        showToast(res.message || 'Failed to send mail', 'error')
      setSubmitting(false)
    }).catch((e) => {
      showToast('Failed to send mail', 'error')
      setSubmitting(false)
    })
  }
  
  const onAttachmentAdd = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const total = attachments().reduce((acc, cur) => acc + cur.size, 0)
      if (total + file.size > 20 * 1024 * 1024) {
        showToast('Attachment limit reached (20MB)', 'error')
        return
      }

      setAttachments((attachments) => [...attachments, file])
    })
  }

  const requiredFieldsFilled = () => (to() && subject())

  return (<>
    <Show when={isLoading()}>
      <div class='w-screen h-screen bg-gradient-to-bl from-sky-800 to-blue-900 flex items-center justify-center'>
        <div class="spinner-grow inline-block w-8 h-8 bg-current rounded-full opacity-0 text-blue-400" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </Show>
    <Show when={!isLoading() && addresses().length > 0}>
      <div class='w-screen h-screen bg-gradient-to-bl from-sky-800 to-blue-900 flex justify-center'>
        <div class='max-w-screen-lg flex flex-col flex-1 m-2'>
          <div class='flex-shrink'>
            <div style='justify-content: space-between;' class='flex flex-row'>
              <div class='pt-1 mb-3 xl:w-96'>
                <select class='form-select appearance-none
                  block
                  w-full
                  px-3
                  py-1.5
                  text-base
                  font-normal
                  bg-clip-padding bg-no-repeat
                  border border-solid border-gray-500
                  rounded
                  transition
                  ease-in-out
                  m-0
                  focus:text-gray-200 focus:border-blue-600 focus:outline-none
                  bg-slate-800
                  text-gray-100'
                    value={selectedAddress() || setSelectedAddress(addresses()[0]._id)}
                    onChange={(e) => {
                      setSelectedAddress(e.target.value)
                      localStorage.setItem('last-address-id', e.target.value)
                    }}
                >
                  <For each={addresses()}>
                    {(address) => <option value={address._id}>{address.address}@noonly.net</option>}
                  </For>
                </select>
              </div>
              <div style={`${isMobile() ? 'margin-top:1px;' : ''}`} class='pt-1'>
                <div class='flex'>
                  <button onClick={() => document.getElementById('upload').click()} disabled={isSubmitting()} class='disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4'>
                    <div class={`${isMobile() ? 'text-sm' : ''}`}>
                      Add Attachment
                    </div>
                  </button>
                  <input type='file' multiple id='upload' onClick={(e) => e.target.value = null} onChange={onAttachmentAdd} style='display:none;' />
                  <Show when={attachments().length > 0 && !isMobile()}>
                    <button disabled={isSubmitting()} class='disabled:opacity-50 disabled:cursor-not-allowed select-none ml-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mb-4' onClick={() => setAttachments([])}>Clear</button>
                  </Show>
                </div>
              </div>
            </div>
            <div class='flex justify-center'>
              <div class={`pl-1 pb-1 ${isMobile() ? 'text-sm' : ''} select-none text-gray-200`}>Recipients, cc and bcc are separated by commas</div>
            </div>
            <div style={`display: flex; flex-direction: ${isMobile() ? 'column' : 'row' };`}>
              <Input value={to()} onChange={(e) => setTo(e.target.value)} placeholder='Recipients *' style='mr-1' />
              <Input value={cc()} onChange={(e) => setCc(e.target.value)} placeholder='cc' style='ml-1 mr-1'  />
              <Input value={bcc()} onChange={(e) => setBcc(e.target.value)} placeholder='bcc' style='ml-1' />
            </div>
            <Input value={subject()} onChange={(e) => setSubject(e.target.value)} placeholder='Subject *' />
            <button disabled={isSubmitting() || !requiredFieldsFilled()} class='disabled:opacity-50 disabled:cursor-not-allowed select-none bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full mb-4' onClick={send}>Send</button>
            <Toolbar ref={setMenu} class='dynamic-shadow bg-gradient-to-bl from-indigo-500 to-blue-600 text-white rounded-lg' horizontal>
              <Show when={editor()} keyed>
                {(instance) => <ToolbarContents editor={instance} /> }
              </Show>
            </Toolbar>
          </div>
          <div class='flex-grow overflow-y-scroll' ref={setContainer} />
          <div class={`flex flex-wrap ${isMobile() ? 'flex-col' : 'flex-row'}`}>
            <For For each={attachments()}>
              {(attachment) => (
                <div class={`flex items-center justify-center rounded bg-slate-800 bg-opacity-75 ${isMobile() ? '' : 'mr-3'} mt-2`}>
                  <div style={`${isMobile() ? 'max-width:86vw;' : 'max-width:20vw;'} white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`} class='select-none py-1 flex-grow text-gray-200 px-2'>{attachment.name}</div>
                  <button disabled={isSubmitting()} style='height:15px;' class='p-4 w-2 h-2 btn-close disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer flex-shrink bg-red-500 hover:bg-red-600 text-white font-bold rounded' onClick={() => setAttachments((attachments) => attachments.filter((a) => a !== attachment))}></button>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
      <Show when={toast()}>
        <div style='position: fixed; z-index:999; bottom: 3%; left: 50%; transform: translate(-50%, 0px);'>
          <Toast toast={toast()} />
        </div>
      </Show>
    </Show>
  </>)
}

export default App