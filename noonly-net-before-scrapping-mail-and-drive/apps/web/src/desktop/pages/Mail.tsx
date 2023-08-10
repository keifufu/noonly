import clsx from 'clsx'
import { Component, createEffect, createSignal, For } from 'solid-js'
import { TMail } from '../../shared/state/mail'
import Store from '../../shared/state/store'

type MailItemProps = Component<{
  mail: TMail,
  setPreventScroll: (preventScroll: boolean) => void
}>

// TODO: velocity based swipe
const MailItem: MailItemProps = (props) => {
  const { mail } = props

  const [dragStart, setDragStart] = createSignal(0)
  const [transition, setTransition] = createSignal(false)
  const [isDragging, setIsDragging] = createSignal(false)
  const [percentOpenLeft, setPercentOpenLeft] = createSignal(0)
  const [percentOpenRight, setPercentOpenRight] = createSignal(0)
  const [yDragStart, setYDragStart] = createSignal(0)

  const onLeftAction = () => {
    console.log('left action')
  }

  const onRightAction = () => {
    console.log('right action')
  }

  createEffect(() => {
    if (percentOpenLeft() === 1)
      onLeftAction()
    if (percentOpenRight() === 1)
      onRightAction()
  })

  const close = () => {
    setTransition(true)
    setIsDragging(false)
    setPercentOpenLeft(0)
    setPercentOpenRight(0)
    props.setPreventScroll(false)
  }

  const handleTouchStart = (e: TouchEvent) => {
    setTransition(false)
    setDragStart(e.touches[0].pageX)
    setYDragStart(e.touches[0].pageY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    const x = e.touches[0].pageX
    const y = e.touches[0].pageY

    if (isDragging()) {
      // figure out the directin of the swipe
      const direction = x - dragStart() > 0 ? 'right' : 'left'

      // calculate the percentage of the swipe
      const percent = Math.abs(x - dragStart()) / window.innerWidth

      // set the percentage of the swipe
      if (direction === 'left')
        setPercentOpenLeft(percent)

      if (direction === 'right')
        setPercentOpenRight(percent)
    } else if (Math.abs(x - dragStart()) > 25 && Math.abs(y - yDragStart()) < 30 && Math.abs(yDragStart() - y) < 30) {
      // activate dragging after 10px
      setIsDragging(true)
      props.setPreventScroll(true)
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    props.setPreventScroll(false)
    if (percentOpenLeft() > 0.5) {
      setTransition(true)
      setPercentOpenLeft(1)
    } else if (percentOpenRight() > 0.5) {
      setTransition(true)
      setPercentOpenRight(1)
    } else {
      close()
    }
  }

  // tailwind
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${percentOpenLeft() > 0 ? percentOpenLeft() * -100 : percentOpenRight() * 100}%)`,
        transition: transition() ? 'transform 0.15s' : 'none',
        overflow: 'hidden',
        'overflow-x': 'hidden',
        'overflow-y': 'hidden'
      }}
    >
      <div class='flex flex-col bg-white rounded-lg shadow-lg overflow-hidden'>
        <div class='flex items-center justify-between px-6 py-3 bg-gray-50'>
          <h3 class='text-gray-700 font-semibold text-lg'>{mail.from}</h3>
          <span class='text-gray-500 text-sm'>{mail.subject}</span>
        </div>
        <div class='px-6 py-4'>
          <p class='text-gray-700 text-base'>{mail.previewText}</p>
        </div>
      </div>
    </div>
  )
}

const Mail: Component = () => {
  const mail = () => Store.mail.get()

  const [preventScroll, setPreventScroll] = createSignal(false)

  const onClick = () => {
    const mail = []
    for (let i = 0; i < 100; i++) {
      mail.push({
        id: i.toString(),
        from: 'keifufu',
        subject: 'Hello world',
        previewText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl. Donec auctor, nisl eget ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl.'
      })
    }
    console.log('done generating mail')
    Store.mail.set(mail)
  }

  return (
    // prevent scroll when dragging
    <div class={clsx('h-screen', preventScroll() && 'overflow-hidden')}>
      <button onClick={onClick}>Generate mail</button>
      <For each={mail()}>
        {(item) => (
          <MailItem mail={item} setPreventScroll={setPreventScroll} />
        )}
      </For>
    </div>
  )
}

export default Mail