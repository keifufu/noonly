import { IconButton, Text } from 'react-native-paper'
import { StyleSheet, View } from 'react-native'
import { ThemeType, useTheme } from 'providers/ThemeProvider'

import { DrawerHeaderProps } from '@react-navigation/drawer'
import React from 'react'
import { STATUS_BAR_HEIGHT } from 'utils/constants'

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ navigation, route }) => {
	const theme = useTheme()
	const styles = makeStyles(theme)
	return (
		<View style={styles.root}>
			<IconButton
				icon='menu'
				onPress={() => navigation.openDrawer()}
			/>
			<Text style={styles.label}>{route.name}</Text>
		</View>
	)
}

const makeStyles = (theme: ThemeType) => StyleSheet.create({
	root: {
		marginTop: STATUS_BAR_HEIGHT,
		backgroundColor: theme.navigation.colors.background,
		paddingBottom: 4,
		paddingTop: 4,
		paddingLeft: 4,
		flexDirection: 'row',
		alignItems: 'center'
	},
	label: {
		marginLeft: 16,
		fontSize: 20,
		fontWeight: 'bold',
		color: theme.navigation.colors.text
	}
})

export default DrawerHeader