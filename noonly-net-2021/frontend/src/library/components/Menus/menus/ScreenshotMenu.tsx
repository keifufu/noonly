import { Dispatch, RootState } from 'main/store/store'
import { MdDelete, MdDeleteForever, MdFileDownload, MdRestore, MdVisibility } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'

import { BiLink } from 'react-icons/bi'
import ContextMenu from 'library/components/ContextMenu'
import ContextMenuItem from 'library/components/ContextMenuItem'
import ContextMenuList from 'library/components/ContextMenuList'
import { ContextMenuProps } from 'library/components/ContextMenu/ContextMenu'
import Invisible from 'library/components/Invisible'
import { SelectionTypes } from '@types'
import copy from 'library/utilities/copy'
import downloadScreenshots from 'library/common/download/downloadScreenshots'
import imgHost from 'library/utilities/imgHost'
import { memo } from 'react'
import { onSubmitProps } from 'library/components/Modals/modals/AlertModal'
import store from 'main/store'
import toast from 'library/utilities/toast'

const ScreenshotMenu: React.FC<ContextMenuProps> = memo(({ id, contextMenu }) => {
	const selection = useSelector((state: RootState) => state.selection.screenshots)
	const screenshot: Noonly.API.Data.Screenshot = contextMenu.data
	const dispatch: Dispatch = useDispatch()
	const ids = selection.length > 0 && selection.includes(screenshot.id) ? selection : [screenshot.id]
	const resetSelection = () => dispatch.selection.setSelection({ type: SelectionTypes.SCREENSHOTS, ids: [] })

	return (
		<ContextMenu id={id} contextMenu={contextMenu}>
			<ContextMenuList>
				<ContextMenuItem
					rIcon={MdVisibility}
					onClick={() => dispatch.overlay.open({ id: 1, data: screenshot })}
				>
					View
				</ContextMenuItem>
				<ContextMenuItem
					onClick={() => {
						copy(`${imgHost}/${screenshot?.name}${screenshot.type === 'gif' ? '.gif' : ''}`).then(() => {
							toast.show('Copied URL to Clipboard')
						}).catch(() => {
							toast.show('Failed to copy URL to Clipboard')
						})
					}}
					rIcon={BiLink}>
						Copy URL
				</ContextMenuItem>
				<ContextMenuItem
					rIcon={MdFileDownload}
					onClick={() => {
						const { screenshots } = store.getState()
						if (ids.length > 25) return toast.showWarning('Can\'t download more than 25 Screenshots at once')
						const names = ids.map((id) => (screenshots.find((screenshot) => screenshot.id === id)?.name || 'Screenshot'))
						downloadScreenshots(names)
					}}
				>
					Download
				</ContextMenuItem>
				<Invisible invisible={screenshot?.trash}>
					<ContextMenuItem
						onClick={() => {
							dispatch.screenshots.editTrash({ ids, trash: true })
							resetSelection()
						}}
						rIcon={MdDelete}>
						Move to Trash
					</ContextMenuItem>
				</Invisible>
				<Invisible visible={screenshot?.trash}>
					<ContextMenuItem
						onClick={() => {
							dispatch.screenshots.editTrash({ ids, trash: false })
							resetSelection()
						}}
						rIcon={MdRestore}>
						Restore
					</ContextMenuItem>
				</Invisible>
				<Invisible visible={screenshot?.trash}>
					<ContextMenuItem
						alert
						rIcon={MdDeleteForever}
						onClick={() => {
							dispatch.modal.open({
								id: 9,
								data: {
									header: 'Delete Screenshot?',
									text: 'Are you sure you want to delete this Screenshot? You cannot undo this action afterwards.',
									buttons: ['Cancel', 'Delete'],
									onSubmit: ({ onSuccess: _onSuccess, onFail }: onSubmitProps) => {
										const onSuccess = () => {
											_onSuccess()
											resetSelection()
										}
										dispatch.screenshots.delete({ ids, onSuccess, onFail })
									}
								}
							})
						}}
					>
						Delete
					</ContextMenuItem>
				</Invisible>
			</ContextMenuList>
		</ContextMenu>
	)
}, (prevProps, nextProps) => {
	if (nextProps.contextMenu.id !== nextProps.id
		&& prevProps.contextMenu.cursors !== nextProps.contextMenu.cursors)
		return true
	return false
})

export default ScreenshotMenu