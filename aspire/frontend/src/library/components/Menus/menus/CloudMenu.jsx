import { CloudUpload, CreateNewFolder, InsertDriveFile, Refresh } from '@material-ui/icons'
import { useDispatch } from 'react-redux'

import Menu from 'library/components/Menu/Menu'

function CloudMenu(props) {
	const { id, contextMenu } = props
	const { open, cursors, anchor, anchorOrigin, transformOrigin, item } = contextMenu
	const dispatch = useDispatch()
	const locationString = location.pathname.includes('/cloud/trash')
		? 'Trash'
		: 'Cloud'

	// Reminder: item is the currentParentId

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
					name: 'Refresh',
					icon: Refresh,
					onClick: () => {
						dispatch.cloud.refresh()
					}
				},
				{
					name: 'New Folder',
					icon: CreateNewFolder,
					visible: locationString === 'Cloud',
					onClick: () => {
						dispatch.dialog.open({
							id: 9,
							payload: item
						})
					}
				},
				{
					name: 'New File',
					icon: InsertDriveFile,
					visible: locationString === 'Cloud',
					onClick: () => {
						dispatch.dialog.open({
							id: 14,
							payload: item
						})
					}
				},
				{
					name: 'Upload Files',
					icon: CloudUpload,
					visible: locationString === 'Cloud',
					onClick: () => {
						const el = document.getElementById('file-upload')
						el.click()
					}
				}
			]}
		/>
	)
}

export default CloudMenu