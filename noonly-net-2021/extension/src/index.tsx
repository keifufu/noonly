/// <reference types='chrome'/>

import { CSSReset, ChakraProvider } from '@chakra-ui/react'

import App from './App'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import store from 'main/store'
import theme from 'library/common/theme'

ReactDOM.render(
	<React.StrictMode>
		<ChakraProvider theme={theme} portalZIndex={999}>
			<Provider store={store}>
				<HelmetProvider>
					<CSSReset />
					<App />
				</HelmetProvider>
			</Provider>
		</ChakraProvider>
	</React.StrictMode>,
	document.getElementById('root')
)