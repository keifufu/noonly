import { Button, Text, TextInput } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, StyleSheet } from 'react-native'

import { AppNavigationType } from 'navigators'
import React from 'react'
import api from 'api'
import { useNavigation } from '@react-navigation/native'
import { useToast } from 'providers/ToastProvider'
import { useUser } from 'providers/UserProvider'

const LoginScreen: React.FC = () => {
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const { control, handleSubmit } = useForm()
	const styles = makeStyles()
	const user = useUser()
	const toast = useToast()
	const navigation = useNavigation<AppNavigationType>()

	const onSubmit = (data: any) => {
		setIsSubmitting(true)
		api.actions.login({ username: data.username.trim(), password: data.password }).then((res) => {
			setIsSubmitting(false)
			// User has 2FA enabled
			if (res.user === null) {
				if (res.twoFAMethods.includes('G-Auth'))
					return navigation.navigate('ConfirmGAuth', res)
				else if (res.twoFAMethods.includes('EMAIL'))
					return navigation.navigate('ConfirmEmailAuth', res)
				else if (res.twoFAMethods.includes('SMS'))
					return navigation.navigate('ConfirmSmsAuth', res)
			} else {
				user.setUser(res.user)
			}
		}).catch((error) => {
			setIsSubmitting(false)
			toast.show(error, { type: 'error' })
		})
	}

	return (
		<ScrollView style={styles.root} keyboardShouldPersistTaps='handled'>
			<Text style={styles.header}>Login</Text>
			<Controller
				control={control}
				render={({
					field: { onChange, onBlur, value, ref },
					fieldState: { invalid }
				}) => (
					<TextInput
						label='Username'
						value={value}
						onChangeText={onChange}
						error={invalid}
						onBlur={onBlur}
						ref={ref}
						onSubmitEditing={handleSubmit(onSubmit)}
					/>
				)}
				name='username'
				rules={{ required: true, minLength: 4, maxLength: 24 }}
				defaultValue=''
			/>
			<Controller
				control={control}
				render={({
					field: { onChange, onBlur, value, ref },
					fieldState: { invalid }
				}) => (
					<TextInput
						label='Password'
						value={value}
						onChangeText={onChange}
						error={invalid}
						onBlur={onBlur}
						ref={ref}
						onSubmitEditing={handleSubmit(onSubmit)}
					/>
				)}
				name='password'
				rules={{ required: true, minLength: 6, maxLength: 2048 }}
				defaultValue=''
			/>
			<Button
				mode='contained'
				loading={isSubmitting}
				disabled={isSubmitting}
				onPress={handleSubmit(onSubmit)}
			>
			Login
			</Button>
			<Button onPress={() => navigation.navigate('Register')}>
				or Sign Up
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

export default LoginScreen