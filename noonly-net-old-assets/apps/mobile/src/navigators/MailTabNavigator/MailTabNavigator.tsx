import MailScreen from 'screens/MailScreen'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import React from 'react'
import { RouteProp } from '@react-navigation/native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { useTheme } from 'providers/ThemeProvider'

export type MailTabParamList = {
	Inbox: undefined
	Archive: undefined
	Sent: undefined
	Trash: undefined
	Other: undefined
}

export type MailTabRouteType<T extends keyof MailTabParamList> = RouteProp<MailTabParamList, T>

const MailTab = createMaterialTopTabNavigator()
const MailTabNavigator: React.FC = () => {
	const theme = useTheme()

	return (
		<MailTab.Navigator screenOptions={{ swipeEnabled: false, tabBarStyle: { backgroundColor: theme.navigation.colors.background } }} tabBarPosition='bottom'>
			<MailTab.Screen
				name='Inbox'
				component={MailScreen}
				options={{
					tabBarLabel: '',
					tabBarLabelStyle: { height: 0 },
					tabBarIcon: ({ color }) => (
						<MaterialIcon name='mail' color={color} size={26} />
					)
				}}
			/>
			<MailTab.Screen
				name='Archive'
				component={MailScreen}
				options={{
					tabBarLabel: '',
					tabBarLabelStyle: { height: 0 },
					tabBarIcon: ({ color }) => (
						<MaterialIcon name='archive' color={color} size={26} />
					)
				}}
			/>
			<MailTab.Screen
				name='Sent'
				component={MailScreen}
				options={{
					tabBarLabel: '',
					tabBarLabelStyle: { height: 0 },
					tabBarIcon: ({ color }) => (
						<MaterialIcon name='send' color={color} size={26} />
					)
				}}
			/>
			<MailTab.Screen
				name='Trash'
				component={MailScreen}
				options={{
					tabBarLabel: '',
					tabBarLabelStyle: { height: 0 },
					tabBarIcon: ({ color }) => (
						<MaterialIcon name='delete' color={color} size={26} />
					)
				}}
			/>
			<MailTab.Screen
				name='Other'
				component={MailScreen}
				options={{
					tabBarLabel: '',
					tabBarLabelStyle: { height: 0 },
					tabBarIcon: ({ color }) => (
						<MaterialIcon name='arrow-forward-ios' color={color} size={26} />
					)
				}}
			/>
		</MailTab.Navigator>
	)
}

export default MailTabNavigator