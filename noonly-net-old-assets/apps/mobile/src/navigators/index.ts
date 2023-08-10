import { CompositeNavigationProp } from '@react-navigation/native'
import { DrawerNavigationProp } from '@react-navigation/drawer'
import { DrawerNavigatorParamList } from './DrawerNavigator/DrawerNavigator'
import { MailTabParamList } from './MailTabNavigator/MailTabNavigator'
import { MaterialBottomTabNavigationProp } from '@react-navigation/material-bottom-tabs'
import { RootStackParamList } from './RootStackNavigator/RootStackNavigator'
import { StackNavigationProp } from '@react-navigation/stack'

export type AppNavigationType = CompositeNavigationProp<
	StackNavigationProp<RootStackParamList>,
	CompositeNavigationProp<
		DrawerNavigationProp<DrawerNavigatorParamList>,
		MaterialBottomTabNavigationProp<MailTabParamList>
	>
>