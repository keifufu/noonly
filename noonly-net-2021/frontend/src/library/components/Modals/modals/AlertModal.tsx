import { useRef, useState } from 'react'

import { Button } from '@chakra-ui/react'
import Modal from '../../Modal'
import { ModalProps } from '../Modals'

export interface onSubmitProps {
	onSuccess: () => void,
	onFail: () => void
}

const AlertModal: React.FC<ModalProps> = ({ modal }) => {
	const [isLoading, setLoading] = useState(false)
	const onClose = () => (isLoading ? null : modal.onClose())
	const cancelRef = useRef(null)
	const { onSubmit, header, buttons, text } = modal.data

	const _onSubmit = () => {
		setLoading(true)
		onSubmit({
			onSuccess: () => {
				setLoading(false)
				onClose()
			},
			onFail: () => setLoading(false)
		})
	}

	return (
		<Modal
			header={header}
			onClose={onClose}
			isOpen={modal.open}
			buttons={<>
				<Button variant='ghost' disabled={isLoading} ref={cancelRef} onClick={onClose}>
					{ buttons && buttons[0] }
				</Button>
				<Button	disabled={isLoading} isLoading={isLoading} onClick={_onSubmit} bg='red.500' _hover={{ bg: 'red.600' }} _active={{ bg: 'red.700' }} ml={3}>
					{ buttons && buttons[1] }
				</Button>
			</>}
		>
			{text}
		</Modal>
	)
}

export default AlertModal