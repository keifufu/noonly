import { Dimensions, Platform, StatusBar } from 'react-native'

export const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight
export const SCREEN_WIDTH = Dimensions.get('window').width
export const SCREEN_HEIGHT = Dimensions.get('window').height
export const SCREEN_HEIGHT_INCLUDING_NAV_BAR = SCREEN_HEIGHT + 20
export const NUMBERS_ONLY_KEYBOARD_TYPE = Platform.OS === 'ios' ? 'number-pad' : 'numeric'
export const PHONE_NUMBER_KEYBOARD_TYPE = Platform.OS === 'ios' ? 'phone-pad' : 'phone-pad'