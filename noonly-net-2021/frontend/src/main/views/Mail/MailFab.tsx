import { MdDeleteForever } from 'react-icons/md'

import { SelectionTypes } from '@types'
import Fab from 'library/components/Fab'
import Invisible from 'library/components/Invisible'
import { onSubmitProps } from 'library/components/Modals/modals/AlertModal'
import { Dispatch } from 'main/store/store'
import { memo } from 'react'
import { useDispatch } from 'react-redux'

interface IProps {
	trash: boolean,
	mailId: string
}

const MailFab: React.FC<IProps> = memo(({ trash, mailId }) => {
	const dispatch: Dispatch = useDispatch()

	return (<>
		{/* <Invisible invisible={!!trash || !!mailId || !devBuild}>
			<Fab
				text='Compose'
				rIcon={MdAdd}
				onClick={() => dispatch.modal.open({ id: 10 })}
			/>
		</Invisible> */}
		<Invisible visible={!!trash}>
			<Fab
				text='Clear Trash'
				rIcon={MdDeleteForever}
				onClick={() => {
					dispatch.modal.open({
						id: 9,
						data: {
							header: 'Delete Mail?',
							text: 'Are you sure you want to delete all this Mail? You cannot undo this action afterwards.',
							buttons: ['Cancel', 'Delete'],
							onSubmit: ({ onSuccess: _onSuccess, onFail }: onSubmitProps) => {
								const onSuccess = () => {
									_onSuccess()
									dispatch.selection.setSelection({ type: SelectionTypes.MAIL, ids: [] })
								}
								dispatch.mail.clearTrash({ onSuccess, onFail })
							}
						}
					})
				}}
			/>
		</Invisible>
	</>)
})

export default MailFab