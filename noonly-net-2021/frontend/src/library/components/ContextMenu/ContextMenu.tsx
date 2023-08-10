import { Drawer, DrawerContent, DrawerOverlay, Menu, MenuButton } from '@chakra-ui/react'
import { createContext, memo, useEffect, useRef, useState } from 'react'

import useIsMobile from 'library/hooks/useIsMobile'

interface ContextType {
	onClose: (() => null) | (() => void)
}

export const MenuContext = createContext<ContextType>({ onClose: () => null })

export interface ContextMenuProps {
	id: number,
	contextMenu: Noonly.State.ContextMenu
}

const ContextMenu: React.FC<ContextMenuProps> = memo(({ id, contextMenu, children }) => {
	const isExtension = process.env.REACT_APP_IS_EXTENSION === 'true'
	const isMobile = useIsMobile(!isExtension)
	const [isOpen, setIsOpen] = useState(false)
	const buttonRef = useRef<null | HTMLButtonElement>(null)

	const onClose = () => {
		setIsOpen(false)
		contextMenu.onClose?.()
	}

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== 'Escape' || !isOpen) return
			setIsOpen(false)
			contextMenu.onClose?.()
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [contextMenu, isOpen])

	useEffect(() => {
		if (contextMenu.id === id) {
			setIsOpen(true)
			/* Click the button for tabIndex to work */
			buttonRef.current?.click()
		} else {
			setIsOpen(false)
		}
	}, [contextMenu, id])

	if (isMobile) {
		return (
			<MenuContext.Provider value={{ onClose }}>
				<Drawer
					placement='bottom'
					isOpen={isOpen}
					onClose={onClose}
				>
					<DrawerOverlay />
					<DrawerContent roundedTop='lg'>
						{children}
					</DrawerContent>
				</Drawer>
			</MenuContext.Provider>
		)
	} else {
		return (
			<Menu onClose={onClose} isOpen={isOpen}>
				<MenuButton
					ref={buttonRef}
					position='fixed'
					top={`${contextMenu.cursors?.y}px`}
					left={`${contextMenu.cursors?.x}px`}
				/>
				{children}
			</Menu>
		)
	}
})

export default ContextMenu