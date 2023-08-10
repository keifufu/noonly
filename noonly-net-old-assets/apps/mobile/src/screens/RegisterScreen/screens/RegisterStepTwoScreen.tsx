import { Button, Text } from 'react-native-paper'

import React from 'react'
import { RegisterStackRouteType } from '../RegisterScreen'
import { View } from 'react-native'
import api from 'api'
import { useRoute } from '@react-navigation/native'
import { useStorage } from 'providers/StorageProvider'
import { useToast } from 'providers/ToastProvider'
import { useUser } from 'providers/UserProvider'

const generateRecoveryCode = () => {
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	let output = ''
	for (let i = 0; i < 8; i++)
		output += charset.charAt(Math.floor(Math.random() * charset.length))
	return output
}

const displayRecoveryCode = (code: string) => `${code.slice(0, 4)}-${code.slice(4, 8)}`

const RegisterStepTwoScreen: React.FC = () => {
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const route = useRoute<RegisterStackRouteType<'RegisterStepTwo'>>()
	const [recoveryCode] = React.useState(generateRecoveryCode())
	const _interval = React.useRef<NodeJS.Timeout>()
	const [timeRemaining, setTimeRemaining] = React.useState(20)
	const storage = useStorage()
	const toast = useToast()
	const user = useUser()

	const onSubmit = React.useCallback(() => {
		setIsSubmitting(true)
		api.actions.register({ ...route.params, recoveryCode }).then((res) => {
			setIsSubmitting(false)
			user.setUser(res)
		}).catch((error) => {
			setIsSubmitting(false)
			toast.show(error, { type: 'error' })
		})
	}, [])

	React.useEffect(() => {
		storage.set('recovery-code', recoveryCode)
		_interval.current = setInterval(() => {
			setTimeRemaining((timeRemaining) => {
				if (timeRemaining === 1)
					clearInterval(_interval.current as NodeJS.Timeout)
				return timeRemaining - 1
			})
		}, 1000)

		return () => clearInterval(_interval.current as NodeJS.Timeout)
	}, [])

	return (
		<View>
			<Text>Hi, please save this code.</Text>
			<Text>{displayRecoveryCode(recoveryCode)}</Text>
			<Button
				mode='contained'
				disabled={timeRemaining > 0 || isSubmitting}
				loading={isSubmitting}
				onPress={onSubmit}
			>
				Continue {timeRemaining > 0 ? `(${timeRemaining}s)` : ''}
			</Button>
		</View>
	)
}

export default RegisterStepTwoScreen