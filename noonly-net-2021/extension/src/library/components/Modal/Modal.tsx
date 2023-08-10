import {
	Modal as ChakraModal,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	ModalProps
} from '@chakra-ui/react'

import useIsMobile from 'library/hooks/useIsMobile'

interface IProps extends ModalProps {
	header: string,
	buttons: JSX.Element,
	disabled?: boolean
}

const Modal: React.FC<IProps> = ({ children, header, buttons, disabled, ...props }) => {
	const isMobile = useIsMobile()

	if (isMobile) {
		return (
			<Drawer
				placement='bottom'
				closeOnOverlayClick={false}
				autoFocus={false}
				{...props}
			>
				<DrawerOverlay />
				<DrawerContent roundedTop='lg'>
					<DrawerHeader>{header}</DrawerHeader>
					<DrawerBody>
						{children}
					</DrawerBody>
					<DrawerFooter>
						{buttons}
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		)
	} else {
		return (
			<ChakraModal
				isCentered
				motionPreset='slideInBottom'
				closeOnOverlayClick={false}
				closeOnEsc={false}
				{...props}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>{header}</ModalHeader>
					<ModalCloseButton disabled={disabled} />
					<ModalBody>
						{children}
					</ModalBody>
					<ModalFooter>
						{buttons}
					</ModalFooter>
				</ModalContent>
			</ChakraModal>
		)
	}
}

export default Modal