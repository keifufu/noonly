import { CardStyleInterpolators, StackHeaderProps, createStackNavigator } from '@react-navigation/stack'

import AddPhoneNumberScreen from 'screens/AddPhoneNumberScreen'
import AddSecondaryEmailScreen from 'screens/AddSecondaryEmailScreen'
import Choose2FAMethodScreen from 'screens/Choose2FAMethodScreen'
import ConfirmBackupCodeScreen from 'screens/ConfirmBackupCodeScreen'
import ConfirmEmailAuthScreen from 'screens/ConfirmEmailAuthScreen'
import ConfirmGAuthScreen from 'screens/ConfirmGAuthScreen'
import ConfirmPhoneNumberScreen from 'screens/ConfirmPhoneNumberScreen'
import ConfirmSmsAuthScreen from 'screens/ConfirmSmsAuthScreen'
import DrawerNavigator from 'navigators/DrawerNavigator'
import EnableGAuthScreen from 'screens/EnableGAuthScreen'
import LoadingScreen from 'screens/LoadingScreen'
import LoginScreen from 'screens/LoginScreen'
import React from 'react'
import RegisterScreen from 'screens/RegisterScreen'
import RootStackHeader from './RootStackHeader'
import { RouteProp } from '@react-navigation/native'
import { useUser } from 'providers/UserProvider'

interface TwoFAProps {
	twoFAMethods: string[],
	twoFAEmail?: string
}

export type RootStackParamList = {
	Loading: undefined
	App: undefined
	EnableGAuth: undefined
	AddSecondaryEmail: undefined
	AddPhoneNumber: undefined
	ConfirmPhoneNumber: undefined
	Login: undefined
	Register: undefined
	ConfirmGAuth: TwoFAProps
	ConfirmEmailAuth: TwoFAProps
	Choose2FAMethod: TwoFAProps
	ConfirmSmsAuth: TwoFAProps
	ConfirmBackupCode: TwoFAProps
}

export type RootStackRouteType<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>

const RootStack = createStackNavigator<RootStackParamList>()
const RootStackNavigator: React.FC = () => {
	const user = useUser()
	const initialRouteName = user.isLoading
		? 'Loading'
		: user.isAuthenticated
			? user.user.phoneNumber
				? user.user.isPhoneNumberConfirmed
					? 'App'
					: 'ConfirmPhoneNumber'
				: 'AddPhoneNumber'
			: 'Login'

	return (
		<RootStack.Navigator
			screenOptions={{
				header: (props: StackHeaderProps) => <RootStackHeader {...props} />,
				cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
			}}
			initialRouteName={initialRouteName}
		>
			{user.isLoading ? (
				<RootStack.Screen name='Loading' component={LoadingScreen} options={{ headerShown: false }} />
			) : user.isAuthenticated
				? user.user.phoneNumber
					? user.user.isPhoneNumberConfirmed
						? (<>
							<RootStack.Screen name='App' component={DrawerNavigator} options={{ headerShown: false }} />
							{/* <RootStack.Screen name='View' component={MailView} /> */}
							<RootStack.Screen name='EnableGAuth' component={EnableGAuthScreen} />
							<RootStack.Screen name='AddSecondaryEmail' component={AddSecondaryEmailScreen} />
						</>) : (<>
							<RootStack.Screen name='ConfirmPhoneNumber' component={ConfirmPhoneNumberScreen} options={{ headerShown: false }} />
						</>) : (<>
						<RootStack.Screen name='AddPhoneNumber' component={AddPhoneNumberScreen} options={{ headerShown: false }} />
					</>) : (<>
					<RootStack.Screen name='Login' component={LoginScreen} options={{ headerShown: false }} />
					<RootStack.Screen name='Register' component={RegisterScreen} options={{ headerShown: false }} />
					<RootStack.Screen name='ConfirmGAuth' component={ConfirmGAuthScreen} options={{ headerShown: false }} />
					<RootStack.Screen name='ConfirmEmailAuth' component={ConfirmEmailAuthScreen} options={{ headerShown: false }} />
					<RootStack.Screen name='ConfirmSmsAuth' component={ConfirmSmsAuthScreen} options={{ headerShown: false }} />
					<RootStack.Screen name='ConfirmBackupCode' component={ConfirmBackupCodeScreen} options={{ headerShown: false }} />
					<RootStack.Screen name='Choose2FAMethod' component={Choose2FAMethodScreen} options={{ headerShown: false }} />
				</>)}
		</RootStack.Navigator>
	)
}

export default RootStackNavigator