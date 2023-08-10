import { ChakraTheme, ThemeConfig, extendTheme } from '@chakra-ui/react'

import { Styles } from '@chakra-ui/theme-tools'

/* Force dark mode for now */
localStorage.setItem('chakra-ui-color-mode', 'dark')

const config: ThemeConfig = {
	initialColorMode: 'dark',
	useSystemColorMode: false
}

const styles: Styles = {
	global: ({ theme }: { theme: any }) => ({
		'*::-webkit-scrollbar': {
			display: 'none !important'
		},
		'*': {
			minWidth: 0,
			minHeight: 0,
			/* Firefox */
			scrollbarWidth: 'none !important',
			WebkitTapHighlightColor: 'transparent'
		},
		'@keyframes highlight': {
			'0%': { backgroundColor: theme.colors.gray['700'], opacity: '0.5' },
			'50%': { backgroundColor: theme.colors.blue['700'], opacity: '1' },
			'100%': { backgroundColor: theme.colors.gray['700'], opacity: '0.5' }
		}
	})
}

const theme: ChakraTheme = extendTheme({ config, styles })

export default theme