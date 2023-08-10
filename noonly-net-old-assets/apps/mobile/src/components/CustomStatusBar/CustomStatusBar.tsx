import React from 'react'
import { StatusBar } from 'react-native'
import { changeBarColors } from 'react-native-immersive-bars'
import { useTheme } from 'providers/ThemeProvider'

const CustomStatusBar: React.FC = () => {
	const theme = useTheme()

	React.useEffect(() => {
		changeBarColors(theme.isDark, '#50000000', 'transparent')
	}, [theme.isDark])

	return (
		<StatusBar
			animated
			backgroundColor='transparent'
			translucent
			barStyle={theme.isDark ? 'light-content' : 'dark-content'}
		/>
	)
}

export default CustomStatusBar