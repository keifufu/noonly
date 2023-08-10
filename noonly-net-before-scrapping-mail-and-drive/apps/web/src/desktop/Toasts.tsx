import { Component, For } from 'solid-js'
import Store from '../shared/state/store'
import { TToast } from '../shared/state/toast'

type ToastProps = Component<{ toast: TToast }>

const ToastComponent: ToastProps = (props) => (
  <div onMouseEnter={() => Store.toast.hold(props.toast.id)} onMouseLeave={() => Store.toast.release(props.toast.id)} class='flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800' >
    <div class='ml-3 text-sm font-normal'>{props.toast.message}</div>
    <button type='button' class='ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700' aria-label='Close'>
      <span class='sr-only'>Close</span>
    </button>
  </div>
)

const ToastContainer: Component = () => (
  <div class='fixed left-[50%] top-0 transition-all duration-500'>
    <For each={Store.toast.get()}>
      {(toast) => (
        <ToastComponent toast={toast} />
      )}
    </For>
  </div>
)

export default ToastContainer