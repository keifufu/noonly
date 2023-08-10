import { MdAdd, MdDelete, MdDeleteForever, MdEdit, MdRestore } from 'react-icons/md'

import ContextMenu from 'library/components/ContextMenu'
import { ContextMenuProps } from 'library/components/ContextMenu/ContextMenu'
import ContextMenuItem from 'library/components/ContextMenuItem'
import ContextMenuList from 'library/components/ContextMenuList'
import Invisible from 'library/components/Invisible'
import { onSubmitProps } from 'library/components/Modals/modals/AlertModal'
import copy from 'library/utilities/copy'
import decrypt from 'library/utilities/decrypt'
import { generateMfaCode } from 'library/utilities/generateMfaCode'
import toast from 'library/utilities/toast'
import { Dispatch } from 'main/store/store'
import { memo } from 'react'
import { HiClipboardCopy } from 'react-icons/hi'
import { useDispatch } from 'react-redux'

const AccountMenu: React.FC<ContextMenuProps> = memo(({ id, contextMenu }) => {
	const account = contextMenu.data
	const dispatch: Dispatch = useDispatch()

	return (
		<ContextMenu id={id} contextMenu={contextMenu}>
			<ContextMenuList>
				<ContextMenuItem
					rIcon={MdEdit}
					onClick={() => dispatch.modal.open({ id: 2, data: account })}
				>
					Edit
				</ContextMenuItem>
				<ContextMenuItem
					rIcon={account.mfaSecret ? MdEdit : MdAdd}
					onClick={() => dispatch.modal.open({ id: 11, data: account })}
				>
					{account.mfaSecret ? 'Edit' : 'Add'} MFA Secret
				</ContextMenuItem>
				<Invisible invisible={account.username?.length === 0}>
					<ContextMenuItem
						onClick={() => {
							copy(account.username).then(() => {
								toast.show('Copied Username to Clipboard')
							}).catch(() => {
								toast.show('Failed to copy Username to Clipboard')
							})
						}}
						rIcon={HiClipboardCopy}>
							Copy Username
					</ContextMenuItem>
				</Invisible>
				<Invisible invisible={account.username?.length > 0 || account.address?.length === 0}>
					<ContextMenuItem
						onClick={() => {
							copy(account.address).then(() => {
								toast.show('Copied Address to Clipboard')
							}).catch(() => {
								toast.show('Failed to copy Address to Clipboard')
							})
						}}
						rIcon={HiClipboardCopy}>
							Copy Address
					</ContextMenuItem>
				</Invisible>
				<ContextMenuItem
					onClick={() => {
						copy(decrypt(account.password)).then(() => {
							toast.show('Copied Password to Clipboard')
						}).catch(() => {
							toast.show('Failed to copy Password to Clipboard')
						})
					}}
					rIcon={HiClipboardCopy}>
						Copy Password
				</ContextMenuItem>
				<Invisible visible={account.mfaSecret !== null}>
					<ContextMenuItem
						onClick={() => {
							generateMfaCode(decrypt(account.mfaSecret)).then((code) => {
								copy(code).then(() => {
									toast.show('Copied Code to Clipboard')
								}).catch(() => {
									toast.show('Failed to copy Code to Clipboard')
								})
							}).catch(() => {
								toast.show('Failed to generate MFA Code (invalid secret?)')
							})
						}}
						rIcon={HiClipboardCopy}>
						Copy MFA Code
					</ContextMenuItem>
				</Invisible>
				<Invisible invisible={account.trash}>
					<ContextMenuItem
						onClick={() => dispatch.accounts.editTrash({ id: account.id, trash: true })}
						rIcon={MdDelete}>
						Move to Trash
					</ContextMenuItem>
				</Invisible>
				<Invisible visible={account.trash}>
					<ContextMenuItem
						onClick={() => dispatch.accounts.editTrash({ id: account.id, trash: false })}
						rIcon={MdRestore}>
						Restore
					</ContextMenuItem>
				</Invisible>
				<Invisible visible={account.trash}>
					<ContextMenuItem
						alert
						rIcon={MdDeleteForever}
						onClick={() => {
							dispatch.modal.open({
								id: 9,
								data: {
									header: 'Delete Account?',
									text: 'Are you sure you want to delete this Account? You cannot undo this action afterwards.',
									buttons: ['Cancel', 'Delete'],
									onSubmit: ({ onSuccess, onFail }: onSubmitProps) => {
										dispatch.accounts.delete({ id: account.id, onSuccess, onFail })
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

export default AccountMenu