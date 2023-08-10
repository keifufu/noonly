import { Button } from '@chakra-ui/react'
import Invisible from 'library/components/Invisible'
import Modal from '../../Modal'
import { ModalProps } from '../Modals'

const FileExistModal: React.FC<ModalProps> = ({ modal }) => {
	const { name, isFolder, onCancel, onOverwrite, onAppend } = modal.data

	return (
		<Modal
			header={`${isFolder ? 'Folder' : 'File'} already exists`}
			onClose={() => {
				onCancel()
				modal.onClose()
			}}
			isOpen={modal.open}
			size='sm'
			buttons={<>
				<Button
					variant='ghost'
					onClick={() => {
						onCancel()
						modal.onClose()
					}}
					mr='3'
				>
					Cancel
				</Button>
				<Invisible invisible={isFolder}>
					<Button
						onClick={() => {
							onOverwrite()
							modal.onClose()
						}}
						type='submit'
						bg='blue.600'
						_hover={{ bg: 'blue.500' }}
						_active={{ bg: 'blue.500' }}
						mr='3'
					>
						Overwrite
					</Button>
				</Invisible>
				<Button
					onClick={() => {
						onAppend()
						modal.onClose()
					}}
					type='submit'
					bg='blue.600'
					_hover={{ bg: 'blue.500' }}
					_active={{ bg: 'blue.500' }}
				>
					Append (1)
				</Button>
			</>}
		>
				A {isFolder ? 'Folder' : 'File'} with the name '{name}' already exists in this Folder.
		</Modal>
	)
}

export default FileExistModal