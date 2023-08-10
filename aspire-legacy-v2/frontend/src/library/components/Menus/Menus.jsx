import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { useEffect } from 'react'

import ScreenshotMenu from './menus/ScreenshotMenu'
import CloudItemMenu from './menus/CloudItemMenu'
import ProfileMenu from './menus/ProfileMenu'
import AccountMenu from './menus/AccountMenu'
import FriendMenu from './menus/FriendMenu'
import CloudMenu from './menus/CloudMenu'
import InputMenu from './menus/InputMenu'
import MailMenu from './menus/MailMenu'

function Menus({ contextMenu, openContextMenu, closeContextMenu }) {
	const history = useHistory()

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

		/* Without this, the history.block below would not work when opening the site from a new tab */
		history.push(history.location)

		return () => {
			document.oncontextmenu = () => false
		}
	// Apparently I learned something wrong, without an empty array this useEffect will act as componentDidUpdate, not componentDidMount
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (contextMenu.open) {
			const unblock = history.block(() => {
				closeContextMenu()
				return false
			})
			return unblock
		}
	}, [closeContextMenu, contextMenu.open, history])

	return (<>
		<ProfileMenu id={1} contextMenu={contextMenu} />
		<AccountMenu id={2} contextMenu={contextMenu} />
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
	openContextMenu: dispatch.contextMenu.open,
	closeContextMenu: dispatch.contextMenu.close
})
export default connect(mapState, mapDispatch)(Menus)