import { Button, Dialog, TextInput } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'

import React from 'react'
import { StyleSheet } from 'react-native'
import { ThemeType } from 'providers/ThemeProvider'
import { createModal } from 'providers/ModalProvider'

export interface ConfirmPasswordModalProps {
	onSubmit: (password: string) => Promise<void>
}

const makeStyles = (theme: ThemeType) => StyleSheet.create({
	modal: {
		backgroundColor: theme.paper.colors.surface
	}
})

const ConfirmPasswordModal = createModal<ReturnType<typeof makeStyles>, ConfirmPasswordModalProps>(makeStyles, ({ modal, onSubmit: _onSubmit }) => {
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const { control, handleSubmit } = useForm()

	const onSubmit = (data: any) => {
		setIsSubmitting(true)
		_onSubmit(data.password).then(() => {
			setIsSubmitting(false)
			modal.close()
		}).catch(() => {
			setIsSubmitting(false)
		})
	}

	return (<>
		<Dialog.Title>Enter your password</Dialog.Title>
		<Dialog.Content>
			<Controller
				control={control}
				render={({
					field: { onChange, onBlur, value, ref },
					fieldState: { invalid }
				}) => (
					<TextInput
						label='Password'
						textContentType='password'
						value={value}
						onChangeText={onChange}
						error={invalid}
						onBlur={onBlur}
						ref={ref}
						onSubmitEditing={handleSubmit(onSubmit)}
					/>
				)}
				name='password'
				rules={{ required: true }}
				defaultValue=''
			/>
		</Dialog.Content>
		<Dialog.Actions>
			<Button disabled={isSubmitting} onPress={() => modal.close()}>Cancel</Button>
			<Button disabled={isSubmitting} loading={isSubmitting} onPress={handleSubmit(onSubmit)}>OK</Button>
		</Dialog.Actions>
	</>)
}, { dismissable: false, dismissableKeyboard: true })


export default ConfirmPasswordModal