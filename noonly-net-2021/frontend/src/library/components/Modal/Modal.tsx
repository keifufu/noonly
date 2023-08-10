import {
	chakra,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay, Modal as ChakraModal, ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	ModalProps,
	shouldForwardProp,
	Text
} from '@chakra-ui/react'

import { isValidMotionProp, motion } from 'framer-motion'

import useIsMobile from 'library/hooks/useIsMobile'
import { RootState } from 'main/store/store'
import { useSelector } from 'react-redux'

const ChakraBox = chakra(motion.div, {
	shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)
})

interface IProps extends ModalProps {
	header: string,
	buttons: JSX.Element,
	disabled?: boolean
}

const Modal: React.FC<IProps> = ({ children, header, buttons, disabled, ...props }) => {
	const isMobile = useIsMobile()
	const user = useSelector((state: RootState) => state.user)
	const useAnimation = /* user.username?.toLowerCase() === 'teekun' || */ localStorage.getItem('useFunkyAnimation') === 'true'

	if (isMobile) {
		return (
			<Drawer
				placement='bottom'
				closeOnOverlayClick={false}
				autoFocus={false}
				motionPreset='none'
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
					<ChakraBox
						animate={useAnimation && {
							scale: [0, 1],
							rotate: [360, 0]
						}}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore no problem in operation, although type error appears.
						transition={useAnimation && {
							duration: 1,
							ease: 'easeInOut',
							repeatType: 'loop'
						}}
					>
						<ModalBody>
							{children}
						</ModalBody>
					</ChakraBox>
					<ModalFooter>
						{useAnimation && <Text style={{ marginRight: 'auto', fontSize: '0.7rem' }}>I hope you like the animation, {user.username}</Text>}
						{buttons}
					</ModalFooter>
				</ModalContent>
			</ChakraModal>
		)
	}
}

export default Modal