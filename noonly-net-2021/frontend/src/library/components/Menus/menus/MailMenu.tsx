import { Dispatch, RootState } from 'main/store/store'
import { MdArchive, MdDelete, MdDeleteForever, MdFileDownload, MdForward, MdMarkunread, MdReply, MdRestore, MdUnarchive } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'

import ContextMenu from 'library/components/ContextMenu'
import ContextMenuItem from 'library/components/ContextMenuItem'
import ContextMenuList from 'library/components/ContextMenuList'
import { ContextMenuProps } from 'library/components/ContextMenu/ContextMenu'
import Invisible from 'library/components/Invisible'
import { SelectionTypes } from '@types'
import { memo } from 'react'
import { onSubmitProps } from 'library/components/Modals/modals/AlertModal'
import toast from 'library/utilities/toast'

const MailMenu: React.FC<ContextMenuProps> = memo(({ id, contextMenu }) => {
	const dispatch: Dispatch = useDispatch()
	const mail: Noonly.API.Data.Mail = contextMenu.data
	const allMail = useSelector((state: RootState) => state.mail)
	const selection = useSelector((state: RootState) => state.selection.mail)
	const selectedMail = selection.map((id) => allMail.find((mail) => mail.id === id))
	const resetSelection = () => dispatch.selection.setSelection({ type: SelectionTypes.MAIL, ids: [] })

	return (
		<ContextMenu id={id} contextMenu={contextMenu}>
			<ContextMenuList>
				<Invisible invisible={selection.length > 1 || mail.trash}>
					<ContextMenuItem
						rIcon={MdReply}
						onClick={() => {
							toast.showWarning('Not yet implemented')
						}}
					>
						Reply
					</ContextMenuItem>
				</Invisible>
				<ContextMenuItem
					rIcon={MdForward}
					onClick={() => {
						toast.showWarning('Not yet implemented')
					}}
				>
					Forward
				</ContextMenuItem>
				<Invisible visible={selectedMail.filter((mail) => mail?.read).length === selection.length}>
					<ContextMenuItem
						rIcon={MdMarkunread}
						onClick={() => {
							dispatch.mail.editRead({
								ids: selection,
								read: false
							})
							resetSelection()
						}}
					>
						Mark as unread
					</ContextMenuItem>
				</Invisible>
				<Invisible visible={selectedMail.filter((mail) => !mail?.read).length === selection.length}>
					<ContextMenuItem
						rIcon={MdMarkunread}
						onClick={() => {
							dispatch.mail.editRead({
								ids: selection,
								read: true
							})
							resetSelection()
						}}
					>
						Mark as read
					</ContextMenuItem>
				</Invisible>
				<Invisible invisible={mail.archived || mail.trash}>
					<ContextMenuItem
						rIcon={MdArchive}
						onClick={() => {
							dispatch.mail.editArchived({
								ids: selection,
								archived: true
							})
							resetSelection()
						}}
					>
						Archive
					</ContextMenuItem>
				</Invisible>
				<Invisible invisible={!mail.archived || mail.trash}>
					<ContextMenuItem
						rIcon={MdUnarchive}
						onClick={() => {
							dispatch.mail.editArchived({
								ids: selection,
								archived: false
							})
							resetSelection()
						}}
					>
						Unarchive
					</ContextMenuItem>
				</Invisible>
				<ContextMenuItem
					rIcon={MdFileDownload}
					onClick={() => {
						toast.showWarning('Not yet implemented')
					}}
				>
					Download
				</ContextMenuItem>
				<Invisible invisible={mail.trash}>
					<ContextMenuItem
						rIcon={MdDelete}
						onClick={() => {
							dispatch.mail.editTrash({
								ids: selection,
								trash: true
							})
							resetSelection()
						}}
					>
						Move to Trash
					</ContextMenuItem>
				</Invisible>
				<Invisible invisible={!mail.trash}>
					<ContextMenuItem
						rIcon={MdRestore}
						onClick={() => {
							dispatch.mail.editTrash({
								ids: selection,
								trash: false
							})
							resetSelection()
						}}
					>
						Restore
					</ContextMenuItem>
				</Invisible>
				<Invisible invisible={!mail.trash}>
					<ContextMenuItem
						alert
						rIcon={MdDeleteForever}
						onClick={() => {
							dispatch.modal.open({
								id: 9,
								data: {
									header: 'Delete Mail?',
									text: 'Are you sure you want to delete these Messages? You cannot undo this action afterwards.',
									buttons: ['Cancel', 'Delete'],
									onSubmit: ({ onSuccess: _onSuccess, onFail }: onSubmitProps) => {
										const onSuccess = () => {
											_onSuccess()
											resetSelection()
										}
										dispatch.mail.delete({ ids: selection, onSuccess, onFail })
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

export default MailMenu