import './index.css'
import './styles/common.scss'

import { ChakraProvider, CSSReset } from '@chakra-ui/react'

import theme from 'library/common/theme'
import store from 'main/store'
import React from 'react'
import ReactDOM from 'react-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'

ReactDOM.render(
	<React.StrictMode>
		<ChakraProvider theme={theme} portalZIndex={999}>
			<Provider store={store}>
				<HelmetProvider>
					<CSSReset />
					<Router>
						<App />
					</Router>
				</HelmetProvider>
			</Provider>
		</ChakraProvider>
	</React.StrictMode>,
	document.getElementById('root')
)