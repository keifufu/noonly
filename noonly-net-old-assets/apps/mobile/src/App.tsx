import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { ThemeContext, ThemeProvider } from 'providers/ThemeProvider'

import CustomStatusBar from '@components/CustomStatusBar'
import { ModalProvider } from 'providers/ModalProvider'
import { NavigationContainer } from '@react-navigation/native'
import { Provider as PaperProvider } from 'react-native-paper'
import React from 'react'
import RootStack from 'navigators/RootStackNavigator'
import { StorageProvider } from 'providers/StorageProvider'
import { Provider as StoreProvider } from 'react-redux'
import { ToastProvider } from 'providers/ToastProvider'
import { UserProvider } from 'providers/UserProvider'
import store from 'store'

const AppRoot: React.FC = () => (
	<SafeAreaProvider>
		<StorageProvider>
			<StoreProvider store={store}>
				<UserProvider>
					<ThemeProvider>
						<ThemeContext.Consumer>
							{(theme) => (
								<PaperProvider theme={theme.paper}>
									<ToastProvider>
										<ModalProvider>
											<NavigationContainer theme={theme.navigation}>
												<CustomStatusBar />
												<RootStack />
											</NavigationContainer>
										</ModalProvider>
									</ToastProvider>
								</PaperProvider>
							)}
						</ThemeContext.Consumer>
					</ThemeProvider>
				</UserProvider>
			</StoreProvider>
		</StorageProvider>
	</SafeAreaProvider>
)

export default AppRoot