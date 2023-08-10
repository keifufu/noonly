/* eslint-disable function-paren-newline */
import { createGenerateClassName, CssBaseline, StylesProvider } from '@material-ui/core'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'

import updateStorage from 'library/update/updateStorage'
import getCookie from 'library/utilities/getCookie'
import storage from 'library/utilities/storage'
import Loading from 'main/views/Loading'
import store from 'main/store'
import App from './App'

updateStorage()

/* Disable default Context Menus */
document.oncontextmenu = () => false

const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: 'a' })
const user = storage.getItem('user', null)
if (user && getCookie('rememberMe')) {
	/* If the user is supposed to be logged in */
	/* Originally render a Loading component */
	render(Loading)

	setTimeout(() => {
		render(App)
	}, 250)
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