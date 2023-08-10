import clsx from 'clsx'
import { Component, createSignal, Show } from 'solid-js'
import useIsMobile from '../shared/hooks/useIsMobile'

const [dragStart, setDragStart] = createSignal(0)
const [isOpen, setIsOpen] = createSignal(false)
const [transition, setTransition] = createSignal(0)
const [percentOpen, setPercentOpen] = createSignal(0)

export function openSidebar(time?: number) {
  setTransition(time || 0.15)
  setPercentOpen(100)
  setIsOpen(true)
}

const Sidebar: Component = () => {
  const isMobile = useIsMobile()

  const widthPercent = 80
  const dragWidthPercent = 5
  const width = screen.width * (widthPercent / 100)
  const invisibleWidth = screen.width * ((100 - widthPercent) / 100)
  const dragWidth = screen.width * (dragWidthPercent / 100)

  const close = () => {
    setTransition(0.15)
    setPercentOpen(0)
    setIsOpen(false)
  }

  const handleTouchStart = (e: TouchEvent) => {
    setTransition(0)
    setDragStart(e.touches[0].pageX)
  }

  const handleTouchMove = (e: TouchEvent) => {
    const x = e.touches[0].pageX

    let percent = Math.round(((x - (dragStart() - width)) / width) * 100)

    if (!isOpen())
      percent -= 100

    if (percent < 100 && percent > 0)
      setPercentOpen(percent)
  }

  const handleTouchEnd = () => {
    setTransition(0.15)
    if (percentOpen() > (isOpen() ? 75 : 25))
      openSidebar()
    else
      close()
  }

  return (<>
    <Show when={!isMobile()}>
      <div class='h-full w-10'>
        <div class='text-white'>Noonly</div>
      </div>
    </Show>
    <Show when={isMobile()}>
      <div
        class='fixed z-10 flex'
        style={{
          bottom: 0,
          left: 0,
          top: 0,
          transform: `translateX(${((percentOpen() / 100) * width) - width}px)`,
          transition: transition() ? `transform ${transition()}s` : 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ width: `${width}px` }} class='h-full bg-green-800'>
          <div class='text-white'>Noonly</div>
        </div>
        <div style={{ width: `${isOpen() ? invisibleWidth : dragWidth}px` }} onClick={close}></div>
      </div>
      <div
        class={clsx('fixed inset-0', {
          'bg-black block': percentOpen() > 0,
          'bg-transparent hidden': percentOpen() === 0
        })}
        style={{
          'z-index': 9,
          opacity: (percentOpen() / 100) * 0.5,
          transition: transition() ? 'opacity 0.3s ease-in-out' : 'none'
        }}
        onClick={close}
      ></div>
    </Show>
  </>)
}

export default Sidebar