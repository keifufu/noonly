import { AppState } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import React from 'react'

interface IProps {
	setValue: (key: string, value: string) => void
	onSubmit: () => void
	key: string
}

const useAutofillCodeOnFocus = ({ setValue, onSubmit, key }: IProps): void => {
	React.useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextAppState) => {
			if (nextAppState === 'active') {
				// Needs a timeout for some reason, it returns an empty string otherwise...
				setTimeout(() => {
					Clipboard.getString().then((clipboardContent) => {
						if (clipboardContent?.length !== 6) return
						const allowedCharacters = '01234567890'.split('')
						for (let i = 0; i < clipboardContent.length; i++) {
							const char = clipboardContent[i]
							if (!allowedCharacters.includes(char))
								return
						}
						setValue(key, clipboardContent)
						onSubmit()
					})
				}, 100)
			}
		})

		return () => subscription.remove()
	}, [])
}

export default useAutofillCodeOnFocus