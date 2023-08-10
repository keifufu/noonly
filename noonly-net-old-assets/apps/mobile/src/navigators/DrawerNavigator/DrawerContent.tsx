import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { ThemeType, useTheme } from 'providers/ThemeProvider'

import React from 'react'
import { StyleSheet } from 'react-native'

const DrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
	const theme = useTheme()
	const styles = makeStyles(theme)

	return (
		<DrawerContentScrollView style={styles.root}>
			<DrawerItemList {...props} />
		</DrawerContentScrollView>
	)
}

const makeStyles = (theme: ThemeType) => StyleSheet.create({
	root: {
		backgroundColor: theme.navigation.colors.background
	}
})

export default DrawerContent