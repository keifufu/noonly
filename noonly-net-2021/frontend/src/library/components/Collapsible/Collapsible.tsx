import React, { useEffect, useRef, useState } from 'react'

import styles from './Collapsible.module.scss'

interface IProps {
	open: boolean
}

const Collapsible: React.FC<IProps> = ({ children, open }) => {
	const [height, setHeight] = useState<number | undefined>(open ? undefined : 0)
	const ref = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (!height || !open || !ref.current) return

		const resizeObserver = new ResizeObserver((el) => {
			setHeight(el[0].contentRect.height)
		})

		resizeObserver.observe(ref.current)
		return () => resizeObserver.disconnect()
	}, [height, open])

	useEffect(() => {
		if (open) setHeight(ref.current?.getBoundingClientRect().height)
		else setHeight(0)
	}, [open])

	return (
		<div style={{ height }} className={styles.root} data-open={open}>
			<div ref={ref}>
				{children}
			</div>
		</div>
	)
}

export default Collapsible