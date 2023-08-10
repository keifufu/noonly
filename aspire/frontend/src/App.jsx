import { createMuiTheme, CssBaseline, makeStyles, ThemeProvider } from '@material-ui/core'
import { Redirect, BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMemo } from 'react'

import CloudTransfers from 'library/components/CloudTransfers'
import Notifications from 'library/components/Notifications'
import UserContext from 'library/contexts/UserContext'
import Backdrops from 'library/components/Backdrops'
import Dialoges from 'library/components/Dialoges'
import Screenshots from 'main/views/Screenshots'
import Sidebar from 'library/components/Sidebar'
import { getThemes } from 'library/common/theme'
import storage from 'library/utilities/storage'
import Header from 'library/components/Header'
import Menus from 'library/components/Menus'
import Passwords from 'main/views/Passwords'
import Register from 'main/views/Register'
import Settings from 'main/views/Settings'
import Inbox from 'main/views/Inbox'
import Login from 'main/views/Login'
import Cloud from 'main/views/Cloud'
import Chat from 'main/views/Chat'
import socket from 'main/socket'

const useStyles = makeStyles((theme) => ({
	root: {
		overflow: 'hidden',
		display: 'flex'
	},
	content: {
		flexGrow: 1
	},
	spacer: {
		...theme.mixins.toolbar
	},
	'@global': {
		'*::-webkit-scrollbar': {
			display: 'none !important'
		},
		'a[href]': {
			color: theme.palette.primary.main,
			textDecoration: 'none',
			'&:hover': {
				textDecoration: 'underline'
			}
		},
		/**
		 * Do not remove this under ANY circumstance
		 * Removing these will cause some flex items to go off-screen
		 * Only God knows why, though.
		 */
		'*': {
			minWidth: 0,
			minHeight: 0,
			'&:focus': {
				outline: 'none'
			}
		}
	}
}))

function App() {
	const classes = useStyles()
	const theme = useSelector((state) => state.theme)
	const { dark, light } = getThemes()
	const MuiTheme = useMemo(() => createMuiTheme(theme === 'dark' ? dark : light), [dark, light, theme])
	const user = storage.getItem('user')

	if (socket.disconnected || !storage.getItem('user', null)) {
		return (
			<ThemeProvider theme={MuiTheme}>
				<CssBaseline />
				<Router>
					<div className={classes.root}>
						<Switch>
							<Route path='/login' component={Login} />
							<Route path='/register' component={Register} />
							<Route path='*'>
								<Redirect to='/login' />
							</Route>
						</Switch>
					</div>
					<Notifications />
				</Router>
			</ThemeProvider>
		)
	}

	return (
		<ThemeProvider theme={MuiTheme}>
			<UserContext.Provider value={user}>
				<CssBaseline />
				<Router>
					<div className={classes.root}>
						<Header />
						<Sidebar />
						<div className={classes.content}>
							<div className={classes.spacer} id='back-to-top-anchor'/>
							<Switch>
								<Route path='/inbox' component={Inbox} />
								<Route path='/screenshots' component={Screenshots} />
								<Route path='/passwords' component={Passwords} />
								<Route path='/cloud' component={Cloud} />
								<Route path='/chat' component={Chat} />
								<Route path='/settings' component={Settings} />
								<Route path='*'>
									<Redirect to='/inbox' />
								</Route>
							</Switch>
						</div>
						<Menus />
						<Dialoges />
						<Backdrops />
						<CloudTransfers />
					</div>
					<Notifications />
				</Router>
			</UserContext.Provider>
		</ThemeProvider>
	)
}

export default App