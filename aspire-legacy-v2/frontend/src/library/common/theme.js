/* eslint-disable multiline-comment-style */
import storage from 'library/utilities/storage'

export const defaultColors = {
	dark: {
		primary: '#8F4AE3',
		secondary: '#00adb5',
		background: '#121212',
		paper: '#1d1d1d'
	},
	light: {
		primary: '#3f51b5',
		secondary: '#f50057',
		background: '#fff',
		paper: '#fafafa'
	}
}

export const getThemes = () => {
	const settings = storage.getSettings()

	const dark = {
		zIndex: {
			tooltip: 9999999999
		},
		palette: {
			type: 'dark',
			primary: {
				main: defaultColors.dark[settings.themes.dark.primary.toLowerCase()] || settings.themes.dark.primary
			},
			secondary: {
				main: defaultColors.dark[settings.themes.dark.secondary.toLowerCase()] || settings.themes.dark.secondary
			},
			coolGrey: {
				50: '#f5f7fa',
				100: '#e4e7eb',
				200: '#cbd2d9',
				300: '#9aa5b1',
				400: '#7b8794',
				500: '#616e7c',
				600: '#52606d',
				700: '#3e4c59',
				800: '#323f4b',
				900: '#1f2933'
			},
			background: {
				paper: defaultColors.dark[settings.themes.dark.paper.toLowerCase()] || settings.themes.dark.paper,
				default: defaultColors.dark[settings.themes.dark.background.toLowerCase()] || settings.themes.dark.background
			}
		}
	}

	const light = {
		zIndex: {
			tooltip: 9999999999
		},
		palette: {
			type: 'light',
			primary: {
				main: defaultColors.light[settings.themes.light.primary.toLowerCase()] || settings.themes.light.primary
			},
			secondary: {
				main: defaultColors.light[settings.themes.light.secondary.toLowerCase()] || settings.themes.light.secondary
			},
			coolGrey: {
				50: '#f5f7fa',
				100: '#e4e7eb',
				200: '#cbd2d9',
				300: '#9aa5b1',
				400: '#7b8794',
				500: '#616e7c',
				600: '#52606d',
				700: '#3e4c59',
				800: '#323f4b',
				900: '#1f2933'
			},
			background: {
				paper: defaultColors.light[settings.themes.light.paper.toLowerCase()] || settings.themes.light.paper,
				default: defaultColors.light[settings.themes.light.background.toLowerCase()] || settings.themes.light.background
			}
		}
	}

	return { dark, light }
}