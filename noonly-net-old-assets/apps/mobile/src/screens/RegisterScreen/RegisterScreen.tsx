import { CompositeNavigationProp, RouteProp } from '@react-navigation/native'
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'
import { AppNavigationType } from 'navigators'
import React from 'react'
import RegisterStepOneScreen from './screens/RegisterStepOneScreen'
import RegisterStepTwoScreen from './screens/RegisterStepTwoScreen'

export type RegisterStackParamList = {
	RegisterStepOne: undefined
	RegisterStepTwo: { username: string, password: string, acceptedTerms: boolean }
}

export type RegisterStackRouteType<T extends keyof RegisterStackParamList> = RouteProp<RegisterStackParamList, T>

export type RegisterNavigationType = CompositeNavigationProp<
	StackNavigationProp<RegisterStackParamList>,
	AppNavigationType
>

const RegisterStack = createStackNavigator<RegisterStackParamList>()
const RegisterScreen: React.FC = () => (
	<RegisterStack.Navigator
		screenOptions={{ headerShown: false }}
		initialRouteName='RegisterStepOne'
	>
		<RegisterStack.Screen name='RegisterStepOne' component={RegisterStepOneScreen} />
		<RegisterStack.Screen name='RegisterStepTwo' component={RegisterStepTwoScreen} />
	</RegisterStack.Navigator>
)

export default RegisterScreen