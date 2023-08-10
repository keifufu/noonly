import { connect } from 'react-redux'
import { useEffect } from 'react'

import ScreenshotMenu from './menus/ScreenshotMenu'
import CloudItemMenu from './menus/CloudItemMenu'
import PasswordMenu from './menus/PasswordMenu'
import ProfileMenu from './menus/ProfileMenu'
import FriendMenu from './menus/FriendMenu'
import CloudMenu from './menus/CloudMenu'
import InputMenu from './menus/InputMenu'
import MailMenu from './menus/MailMenu'

function Menus({ contextMenu, openContextMenu, setContextMenuCursors }) {
	useEffect(() => {
		document.oncontextmenu = (e) => {
			if (e.target instanceof HTMLInputElement) {
				openContextMenu({
					id: 3,
					cursors: {
						x: e.clientX,
						y: e.clientY
					},
					item: e.target
				})
			}
			return false
		}
		return () => {
			document.oncontextmenu = () => false
		}
	})

	return (<>
		<ProfileMenu id={1} contextMenu={contextMenu} />
		<PasswordMenu id={2} contextMenu={contextMenu} />
		<InputMenu id={3} contextMenu={contextMenu} />
		<ScreenshotMenu id={4} contextMenu={contextMenu} />
		<MailMenu id={5} contextMenu={contextMenu} />
		<CloudMenu id={6} contextMenu={contextMenu} />
		<CloudItemMenu id={7} contextMenu={contextMenu} />
		<FriendMenu id={8} contextMenu={contextMenu} />
	</>)
}

const mapState = (state) => ({
	contextMenu: state.contextMenu
})
const mapDispatch = (dispatch) => ({
	setContextMenuCursors: dispatch.contextMenu.setCursors,
	openContextMenu: dispatch.contextMenu.open
})
export default connect(mapState, mapDispatch)(Menus)