import { ThemeProvider, createMuiTheme, withStyles, StylesProvider, createGenerateClassName } from '@material-ui/core/styles'
import { Redirect, BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Screenshots from './components/Screenshots/Screenshots'
import { CssBaseline, withWidth } from '@material-ui/core'
import Passwords from './components/Passwords/Passwords'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import messageManager from './managers/messageManager'
import Sidebar from './components/Navigation/Sidebar'
import friendManager from './managers/friendManager'
import Header from './components/Navigation/Header'
import voiceManager from './managers/voiceManager'
import Register from './components/Auth/Register'
import Inbox from './components/Inbox/Inbox'
import Cloud from './components/Cloud/Cloud'
import { SnackbarProvider } from 'notistack'
import Login from './components/Auth/Login'
import Chat from './components/Chat/Chat'
import React, { Component } from 'react'
import { getCookie } from './Utilities'
import { DndProvider } from 'react-dnd'
import { dark, light } from './theme'
import { connect } from 'react-redux'

class App extends Component {
	constructor(props) {
		super(props)
		this.state = { loggedIn: false }
	}
	
	render() {
		const { classes, darkMode, width } = this.props
		const theme = createMuiTheme(darkMode ? dark : light)
		const mobile = width === 'xs'
		const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: 'a' })

		if((!localStorage.getItem('user') || !getCookie('rememberMe')) && !this.state.loggedIn) {
			localStorage.removeItem('user')
			return (
				<StylesProvider generateClassName={generateClassName}>
				<ThemeProvider theme={theme}>
				<SnackbarProvider maxSnack={3} autoHideDuration={2000}>
				<CssBaseline />
				<Router>
					<Switch>
						<Route exact path='/register' component={() => <Register setState={(state) => this.setState(state)} />} />
						<Route exact path='/login' component={() => <Login setState={(state) => this.setState(state)} />} />
						<Route path='*'>
							<Redirect to='/login' />
						</Route>
					</Switch>
				</Router>
				</SnackbarProvider>
				</ThemeProvider>
				</StylesProvider>
			)
		}
		
		const notistackClasses = { variantSuccess: classes.notistack, variantError: classes.notistack, variantWarning: classes.notistack }
		return (
			<DndProvider backend={mobile ? TouchBackend : HTML5Backend} options={{ delayTouchStart: 100 }}>
			<SnackbarProvider maxSnack={3} autoHideDuration={2000} classes={notistackClasses}>
			<StylesProvider generateClassName={generateClassName}>
			<ThemeProvider theme={theme}>
			<CssBaseline />
			<Router>
				<div className={classes.root} onContextMenu={e => e.preventDefault()}>
					<Header setState={(state) => this.setState(state)} />
					<Sidebar />
					<Switch>
						<Route path='/inbox' component={Inbox} />
						<Route exact path='/screenshots' component={Screenshots} />
						<Route exact path='/passwords' component={Passwords} />
						<Route path='/cloud' component={Cloud} />
						<Route path='/chat' component={Chat} />
						<Route path='*'>
							<Redirect to='/inbox' />
						</Route>
					</Switch>
				</div>
			</Router>
			</ThemeProvider>
			</StylesProvider>
			</SnackbarProvider>
			</DndProvider>
		)
	}

	componentDidMount() {
		if(localStorage.getItem('user')) {
			friendManager.listen()
			messageManager.listen()
			voiceManager.listen()
		}
	}

	componentWillUnmount() {
		if(localStorage.getItem('user')) {
			friendManager.stop()
			messageManager.stop()
			voiceManager.stop()
		}
	}
}

const styles = theme => ({
	root: {
		overflow: 'hidden',
		display: 'flex'
	},
	notistack: {
		[theme.breakpoints.down('xs')]: {
			marginBottom: theme.spacing(7)
		},
		[theme.breakpoints.up('sm')]: {
			marginLeft: theme.spacing(7)
		}
	},
	'@global': {
		'*::-webkit-scrollbar': {
			display: 'none !important'
		},
		/**
		 * Do not remove this under ANY circumstance
		 * Removing these will cause some flex items to go off-screen
		 * Only God knows why, though.
		 **/
		'*': {
			minWidth: 0,
			minHeight: 0
		}
	}
})

const mapStateToProps = state => ({ darkMode: state.generic.darkMode })
const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withWidth()(App)))