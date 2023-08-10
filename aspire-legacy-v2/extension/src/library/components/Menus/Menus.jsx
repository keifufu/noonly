import { connect } from 'react-redux'
import { useEffect } from 'react'

import SettingsMenu from './menus/SettingsMenu'
import PasswordMenu from './menus/PasswordMenu'
import InputMenu from './menus/InputMenu'

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
		<SettingsMenu id={1} contextMenu={contextMenu} />
		<PasswordMenu id={2} contextMenu={contextMenu} />
		<InputMenu id={3} contextMenu={contextMenu} />
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