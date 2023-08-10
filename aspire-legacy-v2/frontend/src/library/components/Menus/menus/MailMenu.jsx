import { Archive, Delete, DeleteForever, Forward, GetApp, Markunread, MoveToInbox, Reply, ReplyAll } from '@material-ui/icons'
import { useLocation } from 'react-router'
import { connect } from 'react-redux'

import downloadMail from 'library/common/download/downloadMail'
import apiHost from 'library/utilities/apiHost'
import Menu from 'library/components/Menu/Menu'

function MailMenu(props) {
	const { id, contextMenu, mail, selection, closeContextMenu, setArchived, setRead, setTrash, setSelection, openDialog } = props
	const { open, cursors, anchor, anchorOrigin, transformOrigin } = contextMenu
	const location = useLocation()
	const locationString = location.pathname.includes('/inbox/trash')
		? 'Trash'
		: location.pathname.includes('/inbox/archived')
			? 'Archived'
			: location.pathname.includes('/inbox/favorite')
				? 'Favorite'
				: 'Inbox'
	let selectedMail = []
	if (mail[mail.selected])
		selectedMail = Object.values(mail[mail.selected]).filter((e) => selection.includes(e.id))

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
					name: 'Reply',
					icon: Reply
				},
				{
					name: 'Reply to all',
					icon: ReplyAll
				},
				{
					name: 'Forward',
					icon: Forward
				},
				{
					name: 'Archive',
					icon: Archive,
					visible: locationString === 'Inbox',
					onClick: () => {
						setArchived({
							ids: selection,
							archived: true
						})
						setSelection([])
					}
				},
				{
					name: 'Unarchive',
					icon: Archive,
					visible: locationString === 'Archived',
					onClick: () => {
						setArchived({
							ids: selection,
							archived: false
						})
						setSelection([])
					}
				},
				{
					name: 'Mark as unread',
					icon: Markunread,
					visible: selectedMail.filter((e) => !!e.isread).length === selection.length,
					onClick: () => {
						setRead({
							ids: selection,
							read: false
						})
						setSelection([])
					}
				},
				{
					name: 'Mark as read',
					icon: Markunread,
					visible: selectedMail.filter((e) => !!e.isread).length !== selection.length,
					onClick: () => {
						setRead({
							ids: selection,
							read: true
						})
						setSelection([])
					}
				},
				{
					name: 'Download',
					icon: GetApp,
					onClick: () => {
						const items = selection.map((id) => ({
							url: `${apiHost}/mail/download?id=${id}`,
							name: `${mail[mail.selected][id].messageId}.eml`
						}))
						downloadMail(items, 'Mail.zip')
						setSelection([])
					}
				},
				{
					name: 'Move to Trash',
					icon: Delete,
					visible: locationString === 'Inbox',
					onClick: () => {
						setTrash({
							ids: selection,
							trash: true
						})
						setSelection([])
					}
				},
				{
					name: 'Move to Inbox',
					icon: MoveToInbox,
					visible: locationString === 'Trash',
					onClick: () => {
						setTrash({
							ids: selection,
							trash: false
						})
					}
				},
				{
					name: 'Delete Forever',
					icon: DeleteForever,
					visible: locationString === 'Trash',
					onClick: () => {
						openDialog({
							id: 8,
							payload: selection
						})
						/* Selection is reset after confirmation of deletion. */
					}
				}
			]}
		/>
	)
}

const mapState = (state) => ({
	mail: state.mail,
	selection: state.selection.mail
})
const mapDispatch = (dispatch) => ({
	closeContextMenu: dispatch.contextMenu.close,
	setArchived: dispatch.mail.setArchived,
	setRead: dispatch.mail.setRead,
	setTrash: dispatch.mail.setTrash,
	setSelection: dispatch.selection.setMailSelection,
	openDialog: dispatch.dialog.open
})
export default connect(mapState, mapDispatch)(MailMenu)