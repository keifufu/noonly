/* eslint-disable function-paren-newline */
import './wdyr'

import { createGenerateClassName, CssBaseline, StylesProvider } from '@material-ui/core'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'

import updateStorage from 'library/update/updateStorage'
import getCookie from 'library/utilities/getCookie'
import devBuild from 'library/utilities/devBuild'
import storage from 'library/utilities/storage'
import Loading from 'main/views/Loading'
import socket from 'main/socket'
import store from 'main/store'
import App from './App'

updateStorage()

/* Disable default Context Menus */
document.oncontextmenu = () => false

/* Disable console log in production builds */
if (!devBuild)
	console.log = () => null

const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: 'a' })
const authenticated = storage.jwt_token
if (authenticated && getCookie('rememberMe')) {
	/* If the user is supposed to be logged in */
	/* Originally render a Loading component */
	render(Loading)

	/* Await Data to be fetched via the socket and load the App afterwards */
	socket.awaitInitialLoad().then(() => {
		render(App)
	})
} else {
	/* If user is not logged in or rememberMe cookie has run out */
	storage.removeItem('user')
	render(App)
}

function render(Component) {
	ReactDOM.render(
		<StylesProvider generateClassName={generateClassName}>
			<Provider store={store}>
				<CssBaseline />
				<Component />
			</Provider>
		</StylesProvider>,
		document.getElementById('root')
	)
}