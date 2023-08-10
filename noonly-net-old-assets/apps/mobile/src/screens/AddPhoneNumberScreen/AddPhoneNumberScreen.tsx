import { Button, Portal, Text } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, StyleSheet } from 'react-native'

import ConfirmationModal from 'modals/ConfirmationModal'
import { ConfirmationModalProps } from 'modals/ConfirmationModal/ConfirmationModal'
import PhoneNumberInput from 'components/PhoneNumberInput'
import React from 'react'
import Screen from 'screens/Screen'
import api from 'api'
import { useModal } from 'providers/ModalProvider'
import { useToast } from 'providers/ToastProvider'
import { useUser } from 'providers/UserProvider'

const createPhoneNumber = (dialCode: string, phoneNumber: string) => {
	let _phoneNumber = ''
	const chars = '01234567890'
	for (let i = 0; i < phoneNumber.length; i++) {
		const char = phoneNumber[i]
		if (chars.includes(char))
			_phoneNumber += char
	}
	return `${dialCode}${_phoneNumber}`
}

const AddPhoneNumberScreen: React.FC = () => {
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const { control, handleSubmit, getValues } = useForm()
	const styles = makeStyles()
	const toast = useToast()
	const user = useUser()
	const modal = useModal()

	const onSubmit = React.useCallback((data: any) => {
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
	}, [])

	const validatePhoneNumber = React.useCallback((data: any) => {
		if (!data.dialCode || !data.phoneNumber) return false
		const phoneNumber = createPhoneNumber(data.dialCode, data.phoneNumber)
		if (phoneNumber.length > 7) return true
	}, [])

	return (
		<Screen>
			<Portal.Host>
				<ScrollView style={styles.root} keyboardShouldPersistTaps='handled'>
					<Text style={styles.header}>Add a Phone Number</Text>
					<Controller
						control={control}
						render={({
							field: { onChange, onBlur, value, ref },
							fieldState: { invalid }
						}) => (
							<PhoneNumberInput
								onSubmit={handleSubmit(onSubmit)}
								value={value}
								onChange={onChange}
								ref={ref}
								onBlur={onBlur}
								invalid={invalid}
							/>
						)}
						name='phoneNumber'
						rules={{ required: true, validate: validatePhoneNumber }}
						defaultValue={{ dialCode: '', phoneNumber: '' }}
					/>
					<Button
						mode='contained'
						loading={isSubmitting}
						disabled={isSubmitting}
						onPress={
							handleSubmit((data) => {
								modal.show<ConfirmationModalProps>(ConfirmationModal, {
									title: 'Are you sure?',
									text: `Please confirm that ${getValues('phoneNumber').phoneNumber} is your phone number. You cannot change this afterwards`,
									onConfirm: () => onSubmit(data),
									timeout: 5
								})
							})
						}
					>
						Confirm
					</Button>
				</ScrollView>
			</Portal.Host>
		</Screen>
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

export default AddPhoneNumberScreen