import { Button, Dialog, Paragraph } from 'react-native-paper'

import React from 'react'
import { StyleSheet } from 'react-native'
import { ThemeType } from 'providers/ThemeProvider'
import { createModal } from 'providers/ModalProvider'

export interface ConfirmationModalProps {
	title: string
	text: string
	onConfirm: () => void
	timeout?: number
}

const makeStyles = (theme: ThemeType) => StyleSheet.create({
	modal: {
		backgroundColor: theme.paper.colors.surface
	}
})

const ConfirmationModal = createModal<ReturnType<typeof makeStyles>, ConfirmationModalProps>(makeStyles, ({ modal, title, text, onConfirm: _onConfirm, timeout }) => {
	const [timeRemaining, setTimeRemaining] = React.useState(timeout || 0)
	const _interval = React.useRef<NodeJS.Timeout>()

	React.useEffect(() => {
		if (!timeout || timeout === 0) return
		_interval.current = setInterval(() => {
			setTimeRemaining((timeRemaining) => {
				if (timeRemaining === 1)
					clearInterval(_interval.current as NodeJS.Timeout)
				return timeRemaining - 1
			})
		}, 1000)

		return () => clearInterval(_interval.current as NodeJS.Timeout)
	}, [])

	const onConfirm = () => {
		modal.close()
		_onConfirm()
	}

	return (<>
		<Dialog.Title>{title}</Dialog.Title>
		<Dialog.Content>
			<Paragraph>
				{text}
			</Paragraph>
		</Dialog.Content>
		<Dialog.Actions>
			<Button onPress={() => modal.close()}>Cancel</Button>
			<Button
				disabled={timeRemaining > 0}
				onPress={onConfirm}
			>
				OK {timeRemaining > 0 ? `(${timeRemaining}s)` : ''}
			</Button>
		</Dialog.Actions>
	</>)
}, { dismissableKeyboard: true })


export default ConfirmationModal