import { Button, Text, TextInput } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, StyleSheet } from 'react-native'

import { NUMBERS_ONLY_KEYBOARD_TYPE } from 'utils/constants'
import React from 'react'
import api from 'api'
import { useToast } from 'providers/ToastProvider'
import { useUser } from 'providers/UserProvider'

const ConfirmPhoneNumberScreen: React.FC = () => {
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const { control, handleSubmit } = useForm()
	const styles = makeStyles()
	const toast = useToast()
	const user = useUser()

	const onSubmit = (data: any) => {
		setIsSubmitting(true)
		api.actions.validateSmsConfirmationCode({ code: data.code }).then(() => {
			setIsSubmitting(false)
			user.setUser({
				...user.user,
				isPhoneNumberConfirmed: true
			})
		}).catch((error) => {
			setIsSubmitting(false)
			toast.show(error, { type: 'error' })
		})
	}

	const sendConfirmationCode = (showError = false) => {
		api.actions.sendSmsConfirmationCode().catch((error) => {
			if (showError)
				toast.show(error, { type: 'error' })
		})
	}

	React.useEffect(() => {
		sendConfirmationCode(true)
	}, [])

	return (
		<ScrollView style={styles.root} keyboardShouldPersistTaps='handled'>
			<Text style={styles.header}>Confirm your Phone Number</Text>
			<Text>We sent a confirmation code to {user.user.phoneNumber}</Text>
			<Controller
				control={control}
				render={({
					field: { onChange, onBlur, value, ref },
					fieldState: { invalid }
				}) => (
					<TextInput
						label='SMS Code'
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
				onPress={() => {
					sendConfirmationCode()
					toast.show('Resent confirmation code')
				}}
			>
				Resend Code
			</Button>
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
	}
})

export default ConfirmPhoneNumberScreen