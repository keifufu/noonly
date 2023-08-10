import { MdDeleteForever, MdHelp } from 'react-icons/md'

import { SelectionTypes } from '@types'
import Fab from 'library/components/Fab'
import Invisible from 'library/components/Invisible'
import { onSubmitProps } from 'library/components/Modals/modals/AlertModal'
import useIsMobile from 'library/hooks/useIsMobile'
import { Dispatch } from 'main/store/store'
import { useDispatch } from 'react-redux'

interface IProps {
	trash: boolean
}

const ScreenshotsFab: React.FC<IProps> = ({ trash }) => {
	const dispatch: Dispatch = useDispatch()
	const isMobile = useIsMobile()

	return (<>
		<Invisible invisible={!!trash || isMobile}>
			<Fab
				text='How do I upload?'
				rIcon={MdHelp}
				onClick={() => dispatch.modal.open({ id: 3 })}
			/>
		</Invisible>
		<Invisible visible={!!trash}>
			<Fab
				text='Clear Trash'
				rIcon={MdDeleteForever}
				onClick={() => {
					dispatch.modal.open({
						id: 9,
						data: {
							header: 'Delete Screenshots?',
							text: 'Are you sure you want to delete all these Screenshots? You cannot undo this action afterwards.',
							buttons: ['Cancel', 'Delete'],
							onSubmit: ({ onSuccess: _onSuccess, onFail }: onSubmitProps) => {
								const onSuccess = () => {
									_onSuccess()
									dispatch.selection.setSelection({ type: SelectionTypes.SCREENSHOTS, ids: [] })
								}
								dispatch.screenshots.clearTrash({ onSuccess, onFail })
							}
						}
					})
				}}
			/>
		</Invisible>
	</>)
}

export default ScreenshotsFab