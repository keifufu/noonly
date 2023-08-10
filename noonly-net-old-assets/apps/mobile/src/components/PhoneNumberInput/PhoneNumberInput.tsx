import { TextInput as RNTextInput, TouchableWithoutFeedback, View } from 'react-native'

import BottomSheet from '@gorhom/bottom-sheet'
import CountrySelectBottomSheet from './CountrySelectBottomSheet'
import React from 'react'
import { TextInput } from 'react-native-paper'
import countries from './countries.json'

interface valueObj {
	dialCode: string
	phoneNumber: string
}

interface IProps {
	onSubmit: () => void
	value: valueObj
	onChange: (value: valueObj) => void
	onBlur: () => void
	invalid: boolean
}

const PhoneNumberInput = React.memo(React.forwardRef<RNTextInput, IProps>(({ value, onSubmit, onChange, invalid, onBlur }, ref) => {
	const bottomSheetRef = React.useRef<BottomSheet>(null)
	const [selectedCountry, setSelectedCountry] = React.useState<typeof countries[0]>(countries[0])

	const onSetSelectedCountry = React.useCallback((country: typeof countries[0]) => {
		setSelectedCountry(country)
		onChange({
			dialCode: selectedCountry.dial_code,
			phoneNumber: value.phoneNumber
		})
		bottomSheetRef.current?.close()
	}, [])

	const onChangeText = React.useCallback((value: string) => {
		onChange({
			dialCode: selectedCountry.dial_code,
			phoneNumber: value
		})
	}, [])

	return (<>
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
				value={value.phoneNumber}
				onChangeText={onChangeText}
				error={invalid}
				onBlur={onBlur}
				ref={ref}
				keyboardType='phone-pad'
				textContentType='telephoneNumber'
				onSubmitEditing={onSubmit}
			/>
		</View>
		<CountrySelectBottomSheet
			countries={countries}
			setSelectedCountry={onSetSelectedCountry}
			ref={bottomSheetRef}
		/>
	</>)
}))

export default PhoneNumberInput