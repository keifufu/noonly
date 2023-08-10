import { Delete, DeleteForever, FileCopy, GetApp, Info, Link, Restore, Visibility } from '@material-ui/icons'
import { connect } from 'react-redux'
import { useContext } from 'react'

import downloadScreenshots from 'library/common/download/downloadScreenshots'
import UserContext from 'library/contexts/UserContext'
import Menu from 'library/components/Menu/Menu'
import copy from 'library/utilities/copy'

function ScreenshotMenu(props) {
	const { id, contextMenu, selection, screenshots, closeContextMenu, openDialog, showNotification, editTrash, openBackdrop, setSelection } = props
	const { open, cursors, anchor, anchorOrigin, transformOrigin, item } = contextMenu
	const user = useContext(UserContext)
	const locationString = location.pathname.includes('/screenshots/trash')
		? 'Trash'
		: location.pathname.includes('/screenshots/favorite')
			? 'Favorite'
			: 'Screenshots'

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
					name: 'View',
					onClick: () => {
						/* Without this timeout the image viewer will close itself instantly */
						setTimeout(() => {
							openBackdrop({
								id: 1,
								payload: `https://${process.env.REACT_APP_HOSTNAME}/ss/${user.username}/${item.name}`
							})
						}, 50)
					},
					icon: Visibility
				},
				{
					name: 'Details',
					onClick: () => {
						openDialog({
							id: 7,
							payload: item
						})
					},
					icon: Info
				},
				{
					name: 'Copy URL',
					onClick: () => {
						const ids = selection.length > 0 ? selection : [item.id]
						const toCopy = ids.map((e) => `https://${process.env.REACT_APP_HOSTNAME}/ss/${user.username}/${screenshots[e].name}`).join(' ')
						copy(toCopy).then(() => {
							showNotification('Copied to Clipboard')
						}).catch(() => {
							showNotification({
								text: 'Something went wrong',
								severity: 'error'
							})
						})
						setSelection([])
					},
					icon: Link
				},
				{
					name: 'Copy to Cloud',
					icon: FileCopy
				},
				{
					name: 'Download',
					icon: GetApp,
					onClick: () => {
						const items = selection.map((e) => ({
							url: `https://${process.env.REACT_APP_HOSTNAME}/ss/${user.username}/${screenshots[e].name}`,
							name: screenshots[e].name
						}))
						downloadScreenshots(items, 'Screenshots.zip').catch((err) => {
							showNotification({
								text: err,
								severity: 'error'
							})
						})
						setSelection([])
					}
				},
				{
					name: 'Restore',
					onClick: () => {
						const ids = selection.length > 0 ? selection : [item.id]
						editTrash({ ids: ids, trash: false })
						setSelection([])
					},
					icon: Restore,
					visible: locationString === 'Trash'
				},
				{
					name: 'Delete Forever',
					onClick: () => {
						const ids = selection.length > 0 ? selection : [item.id]
						openDialog({
							id: 6,
							payload: ids
						})
						setSelection([])
					},
					icon: DeleteForever,
					visible: locationString === 'Trash'
				},
				{
					name: 'Move to Trash',
					onClick: () => {
						const ids = selection.length > 0 ? selection : [item.id]
						editTrash({ ids: ids, trash: true })
						setSelection([])
					},
					icon: Delete,
					visible: locationString === 'Screenshots'
				}
			]}
		/>
	)
}

const mapState = (state) => ({
	selection: state.selection.screenshots,
	screenshots: state.screenshots
})
const mapDispatch = (dispatch) => ({
	closeContextMenu: dispatch.contextMenu.close,
	showNotification: dispatch.notifications.add,
	openDialog: dispatch.dialog.open,
	editTrash: dispatch.screenshots.editTrash,
	openBackdrop: dispatch.backdrop.open,
	setSelection: dispatch.selection.setScreenshotSelection
})
export default connect(mapState, mapDispatch)(ScreenshotMenu)