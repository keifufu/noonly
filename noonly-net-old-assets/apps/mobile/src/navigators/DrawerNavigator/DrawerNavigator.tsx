import { Button, Text } from 'react-native-paper'
import { DrawerHeaderProps, createDrawerNavigator } from '@react-navigation/drawer'

import DrawerContent from './DrawerContent'
import DrawerHeader from './DrawerHeader'
import MailTabNavigator from 'navigators/MailTabNavigator'
import React from 'react'
import { RouteProp } from '@react-navigation/native'
import SettingsScreen from 'screens/SettingsScreen'
import { View } from 'react-native'

const Screen = ({ navigation, route }: { navigation: any, route: any }) => (
	<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
		<Text>{route.name}</Text>
		<Button
			onPress={() => navigation.goBack()}
		>
			Go back
		</Button>
	</View>
)

export type DrawerNavigatorParamList = {
	Mail: undefined
	Accounts: undefined
	Screenshots: undefined
	Settings: undefined
}

export type DrawerNavigatorRouteType<T extends keyof DrawerNavigatorParamList> = RouteProp<DrawerNavigatorParamList, T>

const Drawer = createDrawerNavigator<DrawerNavigatorParamList>()
const DrawerNavigator: React.FC = () => (
	<Drawer.Navigator screenOptions={{
		header: (props: DrawerHeaderProps) => <DrawerHeader {...props} />,
		unmountOnBlur: true
	}} drawerContent={(props) => <DrawerContent {...props} />} initialRouteName='Settings' >
		<Drawer.Screen name='Mail' component={MailTabNavigator} />
		<Drawer.Screen name='Accounts' component={Screen} />
		<Drawer.Screen name='Screenshots' component={Screen} />
		<Drawer.Screen name='Settings' component={SettingsScreen} />
	</Drawer.Navigator>
)

export default DrawerNavigator