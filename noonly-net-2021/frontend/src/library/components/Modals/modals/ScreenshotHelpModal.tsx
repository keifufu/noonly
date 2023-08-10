import { Box, Button, chakra } from '@chakra-ui/react'

import apiHost from 'library/utilities/apiHost'
import copy from 'library/utilities/copy'
import toast from 'library/utilities/toast'
import { RootState } from 'main/store/store'
import { useSelector } from 'react-redux'
import Modal from '../../Modal'
import { ModalProps } from '../Modals'

const ScreenshotHelpModal: React.FC<ModalProps> = ({ modal }) => {
	const user = useSelector((state: RootState) => state.user)

	return (
		<Modal
			header='How do I upload?'
			onClose={modal.onClose}
			isOpen={modal.open}
			size='2xl'
			buttons={<>
				<Button
					variant='filled'
					onClick={modal.onClose}
					bg='blue.600'
					_hover={{ bg: 'blue.500' }}
					_active={{ bg: 'blue.500' }}
				>
					Got It
				</Button>
			</>}
		>
			<Box fontSize='xl' mb='3'>
				Step 1:
				<Box display='inline' fontSize='lg' ml='1'>
					Get
					<chakra.a
						href='https://getsharex.com'
						cursor='pointer'
						marginStart='1'
						color={'blue.300'}
						_hover={{ color: 'blue.300', textDecor: 'underline' }}
						display={{ base: 'block', sm: 'inline' }}
					>
						ShareX
					</chakra.a>
					<Box color='blue.300' fontSize='sm'>
						(or any other customizable screenshot uploader)
					</Box>
				</Box>
			</Box><Box fontSize='xl' mb='3'>
				Step 2:
				<Box display='inline' fontSize='lg' ml='1'>
					Click
					<Box
						cursor='pointer'
						mx='1'
						color={'blue.300'}
						_hover={{ color: 'blue.300' }}
						display={{ base: 'block', sm: 'inline' }}
						onClick={() => {
							const uploaderSettings = `{
								"Version": "14.0.1",
								"Name": "${process.env.REACT_APP_NAME} Screenshots",
								"DestinationType": "ImageUploader",
								"RequestMethod": "POST",
								"RequestURL": "${apiHost}/screenshots/upload",
								"Headers": {
									"imgtoken": "${user.imgToken}"
								},
								"Body": "MultipartFormData",
								"FileFormName": "image"
							}`
							copy(uploaderSettings).then(() => {
								toast.show('Copied Settings to Clipboard')
							}).catch(() => {
								toast.show('Failed to copy Settings to Clipboard')
							})
						}}
					>
						here
					</Box>
					to copy your settings
				</Box>
				<Box color='blue.300' fontSize='sm'>
					(this includes your personal upload token, so don't share it with anyone)
				</Box>
			</Box>
			<Box fontSize='xl' mb='3'>
				Step 3:
				<Box display='inline' fontSize='lg' ml='1'>
					Go to
					<Box color='blue.300' fontSize='lg' display='inline' mx='1.5'>
						Destinations &gt; Custom uploader settings
					</Box>
				</Box>
			</Box>
			<Box fontSize='xl' mb='3'>
				Step 4:
				<Box display='inline' fontSize='lg' ml='1'>
					Click on
					<Box color='blue.300' fontSize='lg' display='inline' mx='1.5'>
						Import &gt; From clipboard
					</Box>
				</Box>
			</Box>
			<Box fontSize='xl' mb='3'>
				Step 5:
				<Box display='inline' fontSize='lg' ml='1'>
					Make sure
					<Box color='blue.300' fontSize='lg' display='inline' mx='1.5'>
						{process.env.REACT_APP_NAME} Screenshots
					</Box>
					is selected as Image uploader
				</Box>
			</Box>
			<Box fontSize='xl' mb='3'>
				Step 6:
				<Box display='inline' fontSize='lg' ml='1'>
					Close the custom uploader settings
				</Box>
			</Box>
			<Box fontSize='xl' mb='3'>
				Step 7:
				<Box display='inline' fontSize='lg' ml='1'>
					Navigate to
					<Box color='blue.300' fontSize='lg' display='inline' mx='1.5'>
						Destinations &gt; Image uploader
					</Box>
					and select
					<Box color='blue.300' fontSize='lg' display='inline' mx='1.5'>
						Custom image uploader
					</Box>
				</Box>
			</Box>
			<Box fontSize='xl' mb='3'>
				Step 8:
				<Box display='inline' fontSize='lg' ml='1'>
					Navigate to
					<Box color='blue.300' fontSize='lg' display='inline' mx='1.5'>
						After capture tasks
					</Box>
					and make sure
					<Box color='blue.300' fontSize='lg' display='inline' mx='1.5'>
						Upload image to host
					</Box>
					is selected
				</Box>
			</Box>
			<Box fontSize='xl'>
				That's it! Try it out by pressing your
				<Box color='blue.300' fontSize='lg' display='inline' mx='1.5'>
					Print Screen
				</Box>
				key.
			</Box>
		</Modal>
	)
}

export default ScreenshotHelpModal