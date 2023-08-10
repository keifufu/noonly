import { createMuiTheme, CssBaseline, makeStyles, ThemeProvider } from '@material-ui/core'
import { Redirect, BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import Notifications from 'library/components/Notifications'
import UserContext from 'library/contexts/UserContext'
import Dialoges from 'library/components/Dialoges'
import { getThemes } from 'library/common/theme'
import storage from 'library/utilities/storage'
import Header from 'library/components/Header'
import Menus from 'library/components/Menus'
import Passwords from 'main/views/Passwords'
import Register from 'main/views/Register'
import Settings from 'main/views/Settings'
import Login from 'main/views/Login'


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
	const user = storage.getItem('user', null)
	const [loggedIn, setLoggedIn] = useState(user !== null)
	window.setLoggedIn = setLoggedIn

	if (!storage.getItem('user', null) || !loggedIn) {
		return (
			<ThemeProvider theme={MuiTheme}>
				<CssBaseline />
				<Router>
					<div className={classes.root}>
						<Switch>
							<Route path='/login' component={Login} setLoggedIn={setLoggedIn} />
							<Route path='/register' component={Register} setLoggedIn={setLoggedIn} />
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
						<div className={classes.content}>
							<div className={classes.spacer} id='back-to-top-anchor'/>
							<Switch>
								<Route path='/passwords' component={Passwords} />
								<Route path='/settings' component={Settings} />
								<Route path='*'>
									<Redirect to='/passwords' />
								</Route>
							</Switch>
						</div>
						<Menus />
						<Dialoges />
					</div>
					<Notifications />
				</Router>
			</UserContext.Provider>
		</ThemeProvider>
	)
}

export default App