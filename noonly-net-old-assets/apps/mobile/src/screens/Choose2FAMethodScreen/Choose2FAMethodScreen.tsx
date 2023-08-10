import { Button, Text } from 'react-native-paper'
import { StyleSheet, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'

import { AppNavigationType } from 'navigators'
import React from 'react'
import { RootStackRouteType } from 'navigators/RootStackNavigator/RootStackNavigator'

const Choose2FAMethodScreen: React.FC = () => {
	const styles = makeStyles()
	const route = useRoute<RootStackRouteType<'Choose2FAMethod'>>()
	const navigation = useNavigation<AppNavigationType>()

	return (
		<View style={styles.root}>
			<Text style={styles.header}>Choose a 2FA Method</Text>
			{route.params.twoFAMethods.includes('G-Auth') && (
				<Button
					onPress={() => navigation.navigate('ConfirmGAuth', route.params)}
				>
					Google Authenticator
				</Button>
			)}
			{route.params.twoFAMethods.includes('EMAIL') && (
				<Button
					onPress={() => navigation.navigate('ConfirmEmailAuth', route.params)}
				>
					Email
				</Button>
			)}
			{route.params.twoFAMethods.includes('SMS') && (
				<Button
					onPress={() => navigation.navigate('ConfirmSmsAuth', route.params)}
				>
					SMS
				</Button>
			)}
			<Button
				onPress={() => navigation.navigate('ConfirmBackupCode', route.params)}
			>
				Enter a Backup Code
			</Button>
		</View>
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

export default Choose2FAMethodScreen