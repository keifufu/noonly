import { useNavigation } from '@react-navigation/native'
import { ThemeType, useTheme } from 'providers/ThemeProvider'
import { useToast } from 'providers/ToastProvider'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Linking, ScrollView, StyleSheet, View } from 'react-native'
import { Button, Checkbox, Text, TextInput } from 'react-native-paper'
import { RegisterNavigationType } from '../RegisterScreen'

const RegisterStepOneScreen: React.FC = () => {
	const { control, handleSubmit, setError } = useForm()
	const theme = useTheme()
	const styles = makeStyles(theme)
	const navigation = useNavigation<RegisterNavigationType>()
	const toast = useToast()

	const onSubmit = React.useCallback((data: any) => {
		if (data.password !== data.confirmPassword)
			return setError('confirmPassword', { message: 'Password does not match', type: 'validate' })
		navigation.navigate('RegisterStepTwo', { username: data.username, password: data.password, acceptedTerms: data.acceptedTerms })
	}, [])

	const openTermsOfService = React.useCallback(async () => {
		const url = 'https://noonly.net/public/TermsOfService'
		const supported = await Linking.canOpenURL(url)
		if (supported)
			await Linking.openURL(url)
		else
			toast.show('Failed to open Terms of Service', { type: 'error' })
	}, [])

	const openPrivacyNotice = React.useCallback(async () => {
		const url = 'https://noonly.net/public/PrivacyNotice'
		const supported = await Linking.canOpenURL(url)
		if (supported)
			await Linking.openURL(url)
		else
			toast.show('Failed to open Terms of Service', { type: 'error' })
	}, [])

	return (
		<ScrollView style={styles.root} keyboardShouldPersistTaps='handled'>
			<Text style={styles.header}>Register</Text>
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
						secureTextEntry
					/>
				)}
				name='password'
				rules={{ required: true, minLength: 6, maxLength: 2048 }}
				defaultValue=''
			/>
			<Controller
				control={control}
				render={({
					field: { onChange, onBlur, value, ref },
					fieldState: { invalid }
				}) => (
					<TextInput
						label='Repeat Password'
						value={value}
						onChangeText={onChange}
						error={invalid}
						onBlur={onBlur}
						ref={ref}
						onSubmitEditing={handleSubmit(onSubmit)}
						secureTextEntry
					/>
				)}
				name='confirmPassword'
				rules={{ required: true, minLength: 6, maxLength: 2048 }}
				defaultValue=''
			/>
			<Controller
				control={control}
				render={({
					field: { onChange, value },
					fieldState: { invalid }
				}) => (
					<View style={{ flexDirection: 'row' }}>
						<Checkbox
							uncheckedColor={invalid ? '#af5b6d' : ''}
							status={ value ? 'checked' : 'unchecked' }
							onPress={() => onChange(!value)}
						/>
						<Text>
							I have read and acknowledge the
							<Text style={styles.link} onPress={openTermsOfService}> Terms of Service </Text>
							and
							<Text style={styles.link} onPress={openPrivacyNotice}> Privacy Notice </Text>
							.
						</Text>
					</View>
				)}
				name='acceptedTerms'
				rules={{ required: true, value: true }}
				defaultValue={false}
			/>
			<Button
				mode='contained'
				// loading={isSubmitting}
				// disabled={isSubmitting}
				onPress={handleSubmit(onSubmit)}
			>
			Continue
			</Button>
			<Button onPress={() => navigation.navigate('Login')}>
				or Sign In
			</Button>
		</ScrollView>
	)
}

const makeStyles = (theme: ThemeType) => StyleSheet.create({
	root: {
		padding: 10,
		height: '100%'
	},
	header: {
		fontSize: 38
	},
	link: {
		color: theme.paper.colors.primary
	}
})

export default RegisterStepOneScreen