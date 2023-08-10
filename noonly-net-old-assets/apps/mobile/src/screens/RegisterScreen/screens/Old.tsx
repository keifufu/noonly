import { Button, Text, TextInput } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'

import { AppNavigationType } from 'navigators'
import BottomSheet from '@gorhom/bottom-sheet'
import CountrySelectBottomSheet from './CountrySelectBottomSheet'
import React from 'react'
import _countries from './countries.json'
import api from 'api'
import { useNavigation } from '@react-navigation/native'
import { useToast } from 'providers/ToastProvider'
import { useUser } from 'providers/UserProvider'

const RegisterStepOneScreen: React.FC = () => {
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const { control, handleSubmit } = useForm()
	const styles = makeStyles()
	const user = useUser()
	const toast = useToast()
	const navigation = useNavigation<AppNavigationType>()
	const bottomSheetRef = React.useRef<BottomSheet>(null)
	const countries = React.useMemo(() => _countries, [])
	const [selectedCountry, setSelectedCountry] = React.useState<typeof countries[0]>(countries[0])

	const onSetSelectedCountry = React.useCallback((country: typeof countries[0]) => {
		setSelectedCountry(country)
		bottomSheetRef.current?.close()
	}, [setSelectedCountry])

	const onSubmit = (data: any) => {
		setIsSubmitting(true)
		api.actions.register({ username: data.username.trim(), password: data.password, phoneNumber: data.phoneNumber }).then((res) => {
			setIsSubmitting(false)
			user.setUser(res)
		}).catch((error) => {
			setIsSubmitting(false)
			toast.show(error, { type: 'error' })
		})
	}

	return (<>
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
					<View style={{ flexDirection: 'row' }}>
						<TouchableWithoutFeedback onPress={() => bottomSheetRef.current?.snapToIndex(0)}>
							<View style={{ width: '20%' }}>
								<TextInput
									label='Country'
									value={selectedCountry.dial_code}
									editable={false}
								/>
							</View>
						</TouchableWithoutFeedback>
						<TextInput
							style={{ marginLeft: 10, flex: 1 }}
							label='Phone Number'
							value={value}
							onChangeText={onChange}
							error={invalid}
							onBlur={onBlur}
							ref={ref}
							keyboardType='phone-pad'
							textContentType='telephoneNumber'
							onSubmitEditing={handleSubmit(onSubmit)}
						/>
					</View>
				)}
				name='phoneNumber'
				// TODO: add phone number validation
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
			<Button onPress={() => navigation.navigate('Login')}>
				or Sign In
			</Button>
		</ScrollView>
		<CountrySelectBottomSheet
			countries={countries}
			setSelectedCountry={onSetSelectedCountry}
			ref={bottomSheetRef}
		/>
	</>)
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

export default RegisterStepOneScreen