import { DarkTheme, LightTheme } from 'common/theme'

import React from 'react'
import { useColorScheme } from 'react-native'
import { useStorage } from './StorageProvider'

type LightThemeType = typeof LightTheme

interface IContextProps extends LightThemeType {
	setScheme: (scheme: string) => void
}

export const ThemeContext = React.createContext<IContextProps>({
	...LightTheme,
	setScheme: () => null
})

export const ThemeProvider: React.FC = ({ children }) => {
	const SyncStorage = useStorage()
	const preferredColorScheme = useColorScheme() // Can be: dark | light | no-preference
	const [currentTheme, setCurrentTheme] = React.useState(preferredColorScheme === 'dark' ? DarkTheme : LightTheme)

	const setScheme = (scheme: string) => {
		SyncStorage.set('colorScheme', scheme)
		setCurrentTheme(scheme === 'dark' ? DarkTheme : LightTheme)
	}

	React.useEffect(() => {
		const colorScheme = SyncStorage.get('colorScheme')
		if (!colorScheme)
			return setCurrentTheme(preferredColorScheme === 'dark' ? DarkTheme : LightTheme)
		setCurrentTheme(colorScheme === 'dark' ? DarkTheme : LightTheme)
	}, [])

	const defaultTheme = {
		...currentTheme,
		setScheme
	}

	return (
		<ThemeContext.Provider value={defaultTheme}>
			{children}
		</ThemeContext.Provider>
	)
}

export const useTheme = (): IContextProps => React.useContext(ThemeContext)

export type ThemeType = typeof LightTheme