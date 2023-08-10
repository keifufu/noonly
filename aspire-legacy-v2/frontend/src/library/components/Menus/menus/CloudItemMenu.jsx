import { Assignment, CloudDownload, Create, Delete, DeleteForever, FileCopy, OpenWith, Restore, Share, Visibility } from '@material-ui/icons'
import textExtensions from 'text-extensions'
import { connect } from 'react-redux'
import nodePath from 'path'

import Menu from 'library/components/Menu/Menu'

function CloudItemMenu(props) {
	const { id, contextMenu, selection, closeContextMenu,
		cloud, openDialog, downloadFiles, addNotification,
		openBackdrop, getImageData, addCachedImage, setTrash,
		setSelection } = props
	const { open, cursors, anchor, anchorOrigin, transformOrigin, item } = contextMenu
	const locationString = location.pathname.includes('/cloud/trash')
		? 'Trash'
		: 'Cloud'

	const ext = nodePath.extname(item?.name).replace('.', '').toLowerCase()


	return (
		<Menu
			open={open === id}
			cursors={cursors}
			anchor={anchor}
			anchorOrigin={anchorOrigin}
			transformOrigin={transformOrigin}
			onClose={closeContextMenu}
			items={[
				{
					name: 'Rename',
					icon: Create,
					visible: locationString === 'Cloud' && selection.length === 0,
					onClick: () => {
						openDialog({
							id: 10,
							payload: item
						})
					}
				},
				{
					name: 'Edit',
					icon: Assignment,
					visible: locationString === 'Cloud' && selection.length === 0 && textExtensions.includes(ext),
					onClick: () => {
						addNotification({
							text: 'This Feature has not been added yet',
							severity: 'info'
						})
					}
				},
				{
					name: 'View',
					icon: Visibility,
					visible: selection.length === 0 && ['jpg', 'jpeg', 'jfif', 'png', 'webm', 'webp', 'gif'].includes(ext),
					onClick: async () => {
						let base64Image = ''
						if (cloud.cachedImages[item?.id]) {
							base64Image = cloud.cachedImages[item?.id]
						} else {
							const res = await getImageData({ id: item?.id })
							addCachedImage({ id: item?.id, base64Image: res.payload })
							base64Image = res.payload
						}
						setTimeout(() => {
							openBackdrop({
								id: 1,
								payload: base64Image
							})
						}, 50)
					}
				},
				{
					name: 'Share',
					icon: Share,
					visible: locationString === 'Cloud' && selection.length === 0,
					onClick: () => {
						openDialog({
							id: 12,
							payload: item
						})
					}
				},
				{
					name: 'Download',
					icon: CloudDownload,
					onClick: () => {
						const ids = selection.length > 0 ? selection : [item.id]
						downloadFiles({ ids })
					}
				},
				{
					name: 'Move',
					icon: OpenWith,
					visible: locationString === 'Cloud',
					onClick: () => {
						openDialog({
							id: 15,
							payload: {
								...item,
								treeDialogTitlePrefix: 'Move',
								submitAction: 1
							}
						})
					}
				},
				{
					name: 'Copy',
					icon: FileCopy,
					visible: locationString === 'Cloud',
					onClick: () => {
						openDialog({
							id: 15,
							payload: {
								...item,
								treeDialogTitlePrefix: 'Copy',
								submitAction: 2
							}
						})
					}
				},
				{
					name: 'Remove',
					icon: Delete,
					visible: locationString === 'Cloud',
					onClick: () => {
						const ids = selection.length > 0 ? selection : [item.id]
						setTrash({ ids, trash: true })
						setSelection([])
					}
				},
				{
					name: 'Restore',
					icon: Restore,
					visible: locationString === 'Trash',
					onClick: () => {
						const ids = selection.length > 0 ? selection : [item.id]
						setTrash({ ids, trash: false })
						setSelection([])
					}
				},
				{
					name: 'Delete',
					icon: DeleteForever,
					visible: locationString === 'Trash',
					onClick: () => {
						openDialog({
							id: 11,
							payload: item
						})
					}
				}
			]}
		/>
	)
}

const mapState = (state) => ({
	selection: state.selection.cloud,
	cloud: state.cloud
})
const mapDispatch = (dispatch) => ({
	closeContextMenu: dispatch.contextMenu.close,
	openDialog: dispatch.dialog.open,
	downloadFiles: dispatch.cloud.downloadFiles,
	addNotification: dispatch.notifications.add,
	openBackdrop: dispatch.backdrop.open,
	getImageData: dispatch.cloud.getImageData,
	addCachedImage: dispatch.cloud.addCachedImage,
	setTrash: dispatch.cloud.setTrash,
	setSelection: dispatch.selection.setCloudSelection
})
export default connect(mapState, mapDispatch)(CloudItemMenu)