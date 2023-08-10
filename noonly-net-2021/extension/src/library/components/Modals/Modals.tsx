import { Portal } from '@chakra-ui/react'
import { RootState } from 'main/store/store'
import { useSelector } from 'react-redux'
import AccountCreateModal from './modals/AccountCreateModal'
import AccountEditModal from './modals/AccountEditModal'
import AccountIconPickerModal from './modals/AccountIconPickerModal'
import AccountMfaModal from './modals/AccountMfaModal'
import AlertModal from './modals/AlertModal'
import ImageUploadModal from './modals/ImageUploadModal'

export interface ModalProps {
	modal: Noonly.State.ModalSingle
}

const Modals: React.FC = () => {
	const modal = useSelector((state: RootState) => state.modal)
	const defaultModal: Noonly.State.ModalSingle = { open: false, onClose: () => null, data: {} }

	return (
		<Portal>
			<AccountCreateModal modal={modal[1] || defaultModal} />
			<AccountEditModal modal={modal[2] || defaultModal} />
			<ImageUploadModal modal={modal[5] || defaultModal} />
			<AccountIconPickerModal modal={modal[6] || defaultModal} />
			<AlertModal modal={modal[9] || defaultModal} />
			<AccountMfaModal modal={modal[11] || defaultModal} />
		</Portal>
	)
}

export default Modals