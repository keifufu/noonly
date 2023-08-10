import { BorderColor, Delete, DeleteForever, Edit, FileCopy, Restore } from '@material-ui/icons'
import { useDispatch } from 'react-redux'

import decrypt from 'library/utilities/decrypt'
import Menu from 'library/components/Menu/Menu'
import copy from 'library/utilities/copy'

function PasswordMenu(props) {
	const { id, contextMenu } = props
	const { open, cursors, anchor, anchorOrigin, transformOrigin, item } = contextMenu
	const dispatch = useDispatch()

	return (
		<Menu
			open={open === id}
			cursors={cursors}
			anchor={anchor}
			anchorOrigin={anchorOrigin}
			transformOrigin={transformOrigin}
			onClose={dispatch.contextMenu.close}
			items={[
				{
					name: 'Edit',
					onClick: () => {
						dispatch.dialog.open({
							id: 3,
							payload: item
						})
					},
					icon: Edit
				},
				{
					name: `${item?.note?.length > 0 ? 'Edit' : 'Add'} Note`,
					onClick: () => {
						dispatch.dialog.open({
							id: 4,
							payload: item
						})
					},
					icon: BorderColor
				},
				{
					name: 'Copy Password',
					onClick: () => {
						copy(decrypt(item.password)).then(() => {
							dispatch.notifications.add('Copied to Clipboard')
						}).catch(() => {
							dispatch.notifications.add({
								text: 'Something went wrong',
								severity: 'error'
							})
						})
					},
					icon: FileCopy
				},
				{
					name: 'Restore',
					onClick: () => {
						dispatch.passwords.setTrash({ id: item.id, trash: false })
					},
					icon: Restore,
					visible: !!item?.trash
				},
				{
					name: 'Delete Forever',
					onClick: () => {
						dispatch.dialog.open({
							id: 2,
							payload: item
						})
					},
					icon: DeleteForever,
					visible: !!item?.trash
				},
				{
					name: 'Move to Trash',
					onClick: () => {
						dispatch.passwords.setTrash({ id: item.id, trash: true })
					},
					icon: Delete,
					visible: !item?.trash
				}
			]}
		/>
	)
}

export default PasswordMenu