import { Brightness4, Brightness7, ExitToApp, Settings } from '@material-ui/icons'
import { useHistory } from 'react-router'
import { connect } from 'react-redux'

import Menu from 'library/components/Menu/Menu'
import storage from 'library/utilities/storage'

function ProfileMenu(props) {
	const { id, contextMenu, theme, toggleTheme, closeContextMenu, showNotification } = props
	const { open, cursors, anchor, anchorOrigin, transformOrigin } = contextMenu
	const history = useHistory()

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
					name: 'Settings',
					icon: Settings,
					onClick: () => {
						history.push('/settings')
					}
				},
				{
					name: 'Toggle Theme',
					onClick: toggleTheme,
					icon: theme === 'dark' ? Brightness7 : Brightness4,
					hidden: 'smUp'
				},
				// eslint-disable-next-line object-curly-newline
				{
					name: 'Logout',
					onClick: () => {
						storage.removeItem('user')
						showNotification('You will be logged out soon.')
						setTimeout(() => window.location.reload(), 1500)
					},
					icon: ExitToApp
				}
			]}
		/>
	)
}

const mapState = (state) => ({
	theme: state.theme
})
const mapDispatch = (dispatch) => ({
	toggleTheme: dispatch.theme.toggle,
	closeContextMenu: dispatch.contextMenu.close,
	showNotification: dispatch.notifications.add
})
export default connect(mapState, mapDispatch)(ProfileMenu)