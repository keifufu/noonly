import ContextMenu from 'library/components/ContextMenu'
import ContextMenuItem from 'library/components/ContextMenuItem'
import ContextMenuList from 'library/components/ContextMenuList'
import { ContextMenuProps } from 'library/components/ContextMenu/ContextMenu'
import { Dispatch } from 'main/store/store'
import { MdDeleteForever } from 'react-icons/md'
import { memo } from 'react'
import { onSubmitProps } from 'library/components/Modals/modals/AlertModal'
import store from 'main/store'
import { useDispatch } from 'react-redux'

const AccountIconMenu: React.FC<ContextMenuProps> = memo(({ id, contextMenu }) => {
	const { icon } = contextMenu.data
	const dispatch: Dispatch = useDispatch()

	return (
		<ContextMenu id={id} contextMenu={contextMenu}>
			<ContextMenuList>
				<ContextMenuItem
					alert
					rIcon={MdDeleteForever}
					onClick={() => {
						const { accounts } = store.getState()
						const iconUsedInAccounts = accounts.filter((account) => account.icon === icon).length
						const usedInAccounts = iconUsedInAccounts === 0 ? '' : ` It is used in ${iconUsedInAccounts} Account${iconUsedInAccounts > 1 ? 's' : ''}.`
						dispatch.modal.open({
							id: 9,
							data: {
								header: 'Delete Icon?',
								text: `Are you sure you want to delete this Icon?${usedInAccounts} You cannot undo this action afterwards.`,
								buttons: ['Cancel', 'Delete'],
								onSubmit: ({ onSuccess, onFail }: onSubmitProps) => {
									dispatch.user.deleteIcon({ icon, onSuccess, onFail })
								}
							}
						})
					}}
				>
					Delete
				</ContextMenuItem>
			</ContextMenuList>
		</ContextMenu>
	)
}, (prevProps, nextProps) => {
	if (nextProps.contextMenu.id !== nextProps.id
		&& prevProps.contextMenu.cursors !== nextProps.contextMenu.cursors)
		return true
	return false
})

export default AccountIconMenu