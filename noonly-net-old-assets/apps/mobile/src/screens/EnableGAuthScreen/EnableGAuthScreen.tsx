import { Button, Text, TextInput } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, StyleSheet } from 'react-native'

import { AppNavigationType } from 'navigators'
import Clipboard from '@react-native-clipboard/clipboard'
import { NUMBERS_ONLY_KEYBOARD_TYPE } from 'utils/constants'
import React from 'react'
import api from 'api'
import useAutofillCodeOnFocus from 'hooks/useAutofillCodeOnFocus'
import { useNavigation } from '@react-navigation/native'
import { useToast } from 'providers/ToastProvider'
import { useUser } from 'providers/UserProvider'

const EnableGAuthScreen: React.FC = () => {
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const { control, handleSubmit, setValue } = useForm()
	const styles = makeStyles()
	const [setupKey, setSetupKey] = React.useState<string>('')
	const toast = useToast()
	const navigation = useNavigation<AppNavigationType>()
	const user = useUser()

	React.useEffect(() => {
		api.actions.generateGAuthSecret().then((res) => {
			setSetupKey(res)
		}).catch((error) => {
			toast.show(error, { type: 'error' })
			navigation.goBack()
		})
	}, [])

	const onSubmit = (data: any) => {
		setIsSubmitting(true)
		api.actions.enableGAuth({ twoFactorAuthenticationCode: data.code }).then(() => {
			setIsSubmitting(false)
			user.setUser({
				...user.user,
				isGAuthEnabled: true
			})
			toast.show('Enabled GAuth')
			navigation.goBack()
		}).catch((error) => {
			setIsSubmitting(false)
			toast.show(error, { type: 'error' })
		})
	}

	useAutofillCodeOnFocus({ setValue, onSubmit: handleSubmit(onSubmit), key: 'code' })

	return (
		<ScrollView style={styles.root} keyboardShouldPersistTaps='handled'>
			<Text style={styles.header}>Enable GAuth</Text>
			<Text>Setup Key: {setupKey || 'Loading'}</Text>
			<Button
				onPress={() => Clipboard.setString(setupKey)}
				mode='contained'
			>
				Copy
			</Button>
			<Controller
				control={control}
				render={({
					field: { onChange, onBlur, value, ref },
					fieldState: { invalid }
				}) => (
					<TextInput
						label='2FA Code'
						value={value}
						onChangeText={onChange}
						error={invalid}
						onBlur={onBlur}
						ref={ref}
						keyboardType={NUMBERS_ONLY_KEYBOARD_TYPE}
						onSubmitEditing={handleSubmit(onSubmit)}
					/>
				)}
				name='code'
				rules={{ required: true, minLength: 6, maxLength: 6 }}
				defaultValue=''
			/>
			<Button
				mode='contained'
				loading={isSubmitting}
				disabled={isSubmitting}
				onPress={handleSubmit(onSubmit)}
			>
		Submit
			</Button>
		</ScrollView>
	)
}

const makeStyles = () => StyleSheet.create({
	root: {
		padding: 10,
		height: '100%'
	},
	header: {
		fontSize: 38
	},
	image: {
		height: 256,
		width: 256
	}
})

export default EnableGAuthScreen