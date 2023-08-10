import clsx from 'clsx'
import { Component, createEffect, createSignal, For, Show } from 'solid-js'
import random from '../../shared/random'
import { removeMail, TMail } from '../../shared/state/mail'
import Store from '../../shared/state/store'

type MailItemProps = Component<{
  mail: TMail,
  setPreventScroll: (preventScroll: boolean) => void
}>

// TODO: velocity based swipe
export const MailItem: MailItemProps = (props) => {
  const [dragStart, setDragStart] = createSignal(0)
  const [transition, setTransition] = createSignal(false)
  const [isDragging, setIsDragging] = createSignal(false)
  const [percentOpenLeft, setPercentOpenLeft] = createSignal(0)
  const [percentOpenRight, setPercentOpenRight] = createSignal(0)
  const [yDragStart, setYDragStart] = createSignal(0)
  const [bgColor, setBgColor] = createSignal('white')

  const onLeftAction = () => {
    setTimeout(() => {
      removeMail(props.mail.id)
    }, 250)
  }

  const onRightAction = () => {
    setTimeout(() => {
      removeMail(props.mail.id)
    }, 250)
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
      // figure out the direction of the swipe
      const direction = x - dragStart() > 0 ? 'right' : 'left'

      // calculate the percentage of the swipe
      const percent = Math.abs(x - dragStart()) / window.innerWidth

      // set the percentage of the swipe
      if (direction === 'left') {
        setBgColor('green')
        setPercentOpenLeft(percent)
      }

      if (direction === 'right') {
        setBgColor('red')
        setPercentOpenRight(percent)
      }
    } else if (Math.abs(x - dragStart()) > 25 && Math.abs(y - yDragStart()) < 30 && Math.abs(yDragStart() - y) < 30) {
      // activate dragging after 10px
      setIsDragging(true)
      props.setPreventScroll(true)
    }
  }

  const handleTouchEnd = () => {
    props.setPreventScroll(false)
    if (percentOpenLeft() > 0.35) {
      setTransition(true)
      setPercentOpenLeft(1)
    } else if (percentOpenRight() > 0.35) {
      setTransition(true)
      setPercentOpenRight(1)
    } else {
      close()
    }
  }

  // tailwind
  return (
    <div class={clsx(
      '',
      `bg-${bgColor()}-500`
    )}>
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
        <div class='flex flex-col bg-slate-500 shadow-lg overflow-hidden'>
          <div class='flex items-center justify-between px-6 py-3 bg-slate-600'>
            <h3 class='text-white font-semibold text-lg'>{props.mail.from}</h3>
            <span class='text-gray-300 text-sm'>{props.mail.subject}</span>
          </div>
          <div class='px-6 py-4 '>
            <p class='text-slate-200 text-base whitespace-nowrap text-ellipsis overflow-hidden'>{props.mail.previewText}</p>
          </div>
        </div>
      </div>
      <div class='h-px bg-white'></div>
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
        previewText: random(100)
      })
    }
    console.log('done generating mail')
    Store.mail.set(mail)
  }

  return (
    // prevent scroll when dragging
    <div class={clsx(
      'h-screen overflow-x-hidden',
      preventScroll() && 'overflow-hidden',
      !preventScroll() && 'overflow-y-scroll'
    )}>
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