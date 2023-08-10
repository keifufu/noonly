import { ThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles'
import { Redirect, BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { createGenerateClassName, CssBaseline, StylesProvider } from '@material-ui/core'
import Passwords from './components/Passwords'
import Register from './components/Register'
import { SnackbarProvider } from 'notistack'
import Header from './components/Header'
import React, { Component } from 'react'
import { getCookie } from './Utilities'
import Login from './components/Login'
import { dark, light } from './theme'

class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			loggedIn: false
		}
	}

	render() {
		const { classes } = this.props
		const darkMode = true /* The Extension does not have a toggle for dark mode, yet */
		const theme = createMuiTheme(darkMode ? dark : light)
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

		return (
			<StylesProvider generateClassName={generateClassName}>
			<ThemeProvider theme={theme}>
			<SnackbarProvider maxSnack={3} autoHideDuration={2000} classes={{ variantSuccess: classes.notistack, variantError: classes.notistack, variantWarning: classes.notistack }}>
			<CssBaseline />
			<Router>
				<div className={classes.root}>
					<Header setState={(state) => this.setState(state)} />
					<Switch>
						<Route exact path='/passwords' component={Passwords} />
						<Route path='*'>
							<Redirect to='/passwords' />
						</Route>
					</Switch>
				</div>
			</Router>
			</SnackbarProvider>
			</ThemeProvider>
			</StylesProvider>
		)
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
		}
	}
})

export default withStyles(styles, { withTheme: true })(App)