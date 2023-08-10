import { Button, Text, TextInput } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, StyleSheet } from 'react-native'

import React from 'react'
import api from 'api'
import { useNavigation } from '@react-navigation/native'
import { useToast } from 'providers/ToastProvider'
import { useUser } from 'providers/UserProvider'

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const AddSecondaryEmailScreen: React.FC = () => {
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const { control, handleSubmit } = useForm()
	const styles = makeStyles()
	const toast = useToast()
	const navigation = useNavigation()
	const user = useUser()

	const onSubmit = (data: any) => {
		setIsSubmitting(true)
		api.actions.addSecondaryEmail({ email: data.email }).then(() => {
			setIsSubmitting(false)
			user.setUser({
				...user.user,
				secondaryEmail: data.email
			})
			navigation.goBack()
		}).catch((error) => {
			setIsSubmitting(false)
			toast.show(error, { type: 'error' })
		})
	}

	return (
		<ScrollView style={styles.root} keyboardShouldPersistTaps='handled'>
			<Text style={styles.header}>Enter Email Address</Text>
			<Controller
				control={control}
				render={({
					field: { onChange, onBlur, value, ref },
					fieldState: { invalid }
				}) => (
					<TextInput
						label='Email Address'
						value={value}
						onChangeText={onChange}
						error={invalid}
						onBlur={onBlur}
						ref={ref}
						keyboardType='email-address'
						onSubmitEditing={handleSubmit(onSubmit)}
					/>
				)}
				name='email'
				rules={{ required: true, pattern: emailRegex }}
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
	}
})

export default AddSecondaryEmailScreen