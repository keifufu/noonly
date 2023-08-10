import { Button, Text, TextInput } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'

import { AppNavigationType } from 'navigators'
import React from 'react'
import { RootStackRouteType } from 'navigators/RootStackNavigator/RootStackNavigator'
import api from 'api'
import { useToast } from 'providers/ToastProvider'
import { useUser } from 'providers/UserProvider'

const ConfirmBackupCodeScreen: React.FC = () => {
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const { control, handleSubmit } = useForm()
	const styles = makeStyles()
	const toast = useToast()
	const user = useUser()
	const route = useRoute<RootStackRouteType<'ConfirmBackupCode'>>()
	const navigation = useNavigation<AppNavigationType>()

	const onSubmit = (data: any) => {
		setIsSubmitting(true)
		api.actions.authenticateWithBackupCode({ backupCode: data.code.split(' ').join('').split('-').join('') }).then((res) => {
			setIsSubmitting(false)
			user.setUser(res)
		}).catch((error) => {
			setIsSubmitting(false)
			toast.show(error, { type: 'error' })
		})
	}

	// Example backup code: 2t5u-ec6b or 2t5uec6b or 2t5u ec6b (a-z0-9) (we remove spaces and - before submitting)
	return (
		<ScrollView style={styles.root} keyboardShouldPersistTaps='handled'>
			<Text style={styles.header}>Enter Code</Text>
			<Text>We sent a confirmation code to: {route.params.twoFAEmail}</Text>
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
						onSubmitEditing={handleSubmit(onSubmit)}
					/>
				)}
				name='code'
				rules={{ required: true, minLength: 8, maxLength: 9 }}
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
			<Button
				onPress={() => navigation.navigate('Choose2FAMethod', route.params)}
			>
				Use other 2FA Method
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

export default ConfirmBackupCodeScreen