import { Button, Text, TextInput } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'

import { AppNavigationType } from 'navigators'
import { NUMBERS_ONLY_KEYBOARD_TYPE } from 'utils/constants'
import React from 'react'
import { RootStackRouteType } from 'navigators/RootStackNavigator/RootStackNavigator'
import api from 'api'
import useAutofillCodeOnFocus from 'hooks/useAutofillCodeOnFocus'
import { useToast } from 'providers/ToastProvider'
import { useUser } from 'providers/UserProvider'

const ConfirmGAuthScreen: React.FC = () => {
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const { control, handleSubmit, setValue } = useForm()
	const styles = makeStyles()
	const toast = useToast()
	const user = useUser()
	const route = useRoute<RootStackRouteType<'ConfirmGAuth'>>()
	const navigation = useNavigation<AppNavigationType>()

	const onSubmit = (data: any) => {
		setIsSubmitting(true)
		api.actions.authenticateWithGAuth({ twoFactorAuthenticationCode: data.code }).then((res) => {
			setIsSubmitting(false)
			user.setUser(res)
		}).catch((error) => {
			setIsSubmitting(false)
			toast.show(error, { type: 'error' })
		})
	}

	useAutofillCodeOnFocus({ setValue, onSubmit: handleSubmit(onSubmit), key: 'code' })

	return (
		<ScrollView style={styles.root} keyboardShouldPersistTaps='handled'>
			<Text style={styles.header}>Enter Google Authenticator 2FA Code</Text>
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

export default ConfirmGAuthScreen