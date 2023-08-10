import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'

import styles from './Popper.module.scss'
import { usePopper } from '@chakra-ui/popper'

const Popper: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const { getPopperProps, getReferenceProps } = usePopper({ placement: 'bottom-start' })

	const onClick = () => {
		setIsOpen(!isOpen)
	}

	const slide = {
		exit: {
			opacity: 0,
			scale: 0.5
		},
		enter: {
			opacity: 1,
			scale: 1
		}
	}

	return (<>
		<button {...getReferenceProps({ onClick })}>Click me</button>
		<div {...getPopperProps()}>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						transition={{
							type: 'ease',
							duration: 0.2,
							easeInOut: true
						}}
						variants={slide}
						initial='exit'
						animate='enter'
						exit='exit'
						style={{ transformOrigin: 'top left' }}
						className={styles.popper}
					>
						Hello
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	</>)
}

export default Popper