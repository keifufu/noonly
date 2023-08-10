import useIsMobile from 'library/hooks/useIsMobile'
import { RootState } from 'main/store/store'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Invisible from '../Invisible'
import Sidebar from './Sidebar'

const Wrapper: React.FC = () => {
	const isMobile = useIsMobile()

	const [dragging, setDragging] = useState(false)
	const [dragStart, setDragStart] = useState(0)
	const [isOpen, setIsOpen] = useState(false)
	const [transition, setTransition] = useState(false)

	const widthPercent = 80
	const dragWidthPercent = 5
	const width = screen.width * (widthPercent / 100)
	const invisibleWidth = screen.width * ((100 - widthPercent) / 100)
	const dragWidth = screen.width * (dragWidthPercent / 100)
	const [percentOpen, setPercentOpen] = useState(0)

	const sidebarIsOpen = useSelector((state: RootState) => state.sidebar.open)
	const dispatch = useDispatch()

	const close = useCallback(() => {
		setTransition(true)
		setPercentOpen(0)
		setIsOpen(false)
		dispatch.sidebar.setOpen(false)
	}, [dispatch.sidebar])

	const open = () => {
		setTransition(true)
		setPercentOpen(100)
		setIsOpen(true)
	}

	useEffect(() => {
		if (sidebarIsOpen)
			open()
		else
			close()
	}, [sidebarIsOpen, close])

	const handleTouchStart = (e: any) => {
		// if (!isOpen() && e.touches[0].pageX > 30) return

		setTransition(false)
		setDragStart(e.touches[0].pageX)
		setDragging(true)
	}

	const handleTouchMove = (e: any) => {
		if (dragging) {
			const x = e.touches[0].pageX

			let percent = Math.round(((x - (dragStart - width)) / width) * 100)

			if (!isOpen)
				percent -= 100

			if (percent < 100 && percent > 0)
				setPercentOpen(percent)
		}
	}

	const handleTouchEnd = () => {
		setDragging(false)
		setTransition(true)
		if (percentOpen > (isOpen ? 75 : 25))
			open()
		else
			close()
	}

	return (<>
		<Invisible visible={isMobile}>
			<div
				style={{
					position: 'fixed',
					display: 'flex',
					zIndex: 999999999,
					bottom: 0,
					left: 0,
					top: 0,
					transform: `translateX(${((percentOpen / 100) * width) - width}px)`,
					transition: transition ? 'transform 0.15s' : 'none'
				}}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				<div style={{ width: `${width}px`, height: '100%', backgroundColor: 'rgb(22 101 52 / 1)' }}>
					<Sidebar onClose={close} />
				</div>
				<div style={{ width: `${isOpen ? invisibleWidth : dragWidth}px` }} onClick={close}></div>
			</div>
			<div
				style={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					top: 0,
					backgroundColor: percentOpen > 0 ? 'black' : 'transparent',
					display: percentOpen > 0 ? 'block' : 'none',
					zIndex: 999999998,
					opacity: (percentOpen / 100) * 0.5,
					transition: transition ? 'opacity 0.2s ease-in-out' : 'none'
				}}
				onClick={close}
			></div>
		</Invisible>
	</>)
}

export default Wrapper