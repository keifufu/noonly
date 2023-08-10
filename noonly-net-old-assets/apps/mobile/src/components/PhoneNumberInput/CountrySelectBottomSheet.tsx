import BottomSheet, { BottomSheetFlatList, TouchableWithoutFeedback } from '@gorhom/bottom-sheet'
import { Keyboard, StyleSheet, View } from 'react-native'
import { Portal, Text, TextInput } from 'react-native-paper'
import { SCREEN_HEIGHT_INCLUDING_NAV_BAR, SCREEN_WIDTH } from 'utils/constants'
import { ThemeType, useTheme } from 'providers/ThemeProvider'

import BottomSheetBackdrop from 'components/BottomSheetBackdrop/BottomSheetBackdrop'
import React from 'react'

interface IProps {
	countries: any,
	setSelectedCountry: (country: any) => void
}

const CountrySelectBottomSheet = React.memo(React.forwardRef<BottomSheet, IProps>(({ countries, setSelectedCountry }, ref) => {
	const snapPoints = React.useMemo(() => ['60%', SCREEN_HEIGHT_INCLUDING_NAV_BAR], [])
	const theme = useTheme()
	const styles = makeStyles(theme)
	const [search, setSearch] = React.useState('')

	const onCountrySelect = React.useCallback((country: any) => {
		setSearch('')
		setSelectedCountry(country)
	}, [setSelectedCountry])

	const renderListItem = React.useCallback(({ item }: { item: any }) => (
		<TouchableWithoutFeedback key={item.name} onPress={() => onCountrySelect(item)}>
			<View style={styles.row}>
				<Text>{item.name}</Text>
				<Text>{item.dial_code}</Text>
			</View>
		</TouchableWithoutFeedback>
	), [onCountrySelect])

	const renderBackdrop = React.useCallback((props) => (
		<BottomSheetBackdrop
			{...props}
			disappearsOnIndex={-1}
			appearsOnIndex={1}
		/>
	), [])

	return (
		<Portal>
			<BottomSheet
				ref={ref}
				index={-1}
				snapPoints={snapPoints}
				enablePanDownToClose
				handleStyle={styles.bottomSheetHandle}
				backgroundStyle={styles.background}
				onAnimate={(from, to) => {
					if (to === -1) {
						Keyboard.dismiss()
						setSearch('')
					}
				}}
				backdropComponent={renderBackdrop}
			>
				<View style={{ flex: 1 }}>
					<TextInput
						label='Search'
						onChangeText={setSearch}
						value={search}
					/>
					<BottomSheetFlatList
						data={countries.filter((country: any) => country.name.toLowerCase().includes(search.toLowerCase()))}
						keyExtractor={(country) => country.name}
						renderItem={renderListItem}
						contentContainerStyle={styles.bottomSheetContainer}
					/>
				</View>
			</BottomSheet>
		</Portal>
	)
}))

const makeStyles = (theme: ThemeType) => StyleSheet.create({
	bottomSheetHandle: {
		// backgroundColor: theme.paper.colors.surface
	},
	background: {
		backgroundColor: theme.paper.colors.surface
	},
	bottomSheetContainer: {
		backgroundColor: theme.paper.colors.surface
	},
	row: {
		flexDirection: 'row',
		width: SCREEN_WIDTH,
		justifyContent: 'space-between',
		paddingLeft: 7,
		paddingRight: 7,
		paddingTop: 10,
		paddingBottom: 10
	}
})

export default CountrySelectBottomSheet