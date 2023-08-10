import { Snackbar, Text } from 'react-native-paper'
import { StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { ThemeType, useTheme } from './ThemeProvider'

import React from 'react'

export interface ToastOptions {
	visible?: boolean,
	action?: string
	actionOnPress?: () => void
	duration?: number
	onDismiss?: () => void
	text: string,
	type?: 'success' | 'warning' | 'error'
}

const createToastOptions = (options: ToastOptions) => ({
	visible: true,
	duration: 7000,
	...options
})

interface IContextProps {
	hide: () => void
	show: (arg1: string | ToastOptions, arg2?: Partial<ToastOptions>) => void
}

const defaultState = {
	hide: () => null,
	show: () => null
}

export const ToastContext = React.createContext<IContextProps>(defaultState)

export const ToastProvider: React.FC = ({ children }) => {
	const [toastOptions, setToastOptions] = React.useState<ToastOptions>(createToastOptions({ text: '', visible: false }))
	const theme = useTheme()
	const styles = makeStyles(theme)

	const hideToast = () => {
		setToastOptions((toastOptions) => ({
			...toastOptions,
			visible: false
		}))
	}

	const showToast = (arg1: string | ToastOptions, arg2?: Partial<ToastOptions>) => {
		let newToastOptions: Partial<ToastOptions> = {}
		if (typeof arg1 === 'object' && arg1?.text) {
			newToastOptions = arg1
		} else {
			newToastOptions.text = arg1.toString() || 'Something went wrong'
			newToastOptions = {
				...newToastOptions,
				...arg2
			}
		}
		setToastOptions(createToastOptions(newToastOptions as ToastOptions))
	}

	const ToastProviderState = React.useMemo(() => ({
		hide: hideToast,
		show: showToast
	}), [])

	return (<>
		<ToastContext.Provider value={ToastProviderState}>
			{children}
		</ToastContext.Provider>
		<TouchableWithoutFeedback onPress={hideToast}>
			<Snackbar
				visible={!!toastOptions.visible}
				action={toastOptions.action ? {
					label: toastOptions.action,
					onPress: toastOptions.actionOnPress
				} : undefined}
				duration={toastOptions.duration}
				onDismiss={() => {
					hideToast()
					if (typeof toastOptions.onDismiss === 'function')
						toastOptions.onDismiss()
				}}
				style={styles[toastOptions.type || 'success']}
			>
				<Text>{toastOptions.text}</Text>
			</Snackbar>
		</TouchableWithoutFeedback>
	</>)
}

const makeStyles = (theme: ThemeType) => StyleSheet.create({
	success: {
		backgroundColor: theme.colors['green-600'],
		zIndex: 999999
	},
	warning: {
		backgroundColor: theme.colors['yellow-600'],
		zIndex: 999999
	},
	error: {
		backgroundColor: theme.colors['red-600'],
		zIndex: 999999
	}
})

export const useToast = (): IContextProps => React.useContext(ToastContext)