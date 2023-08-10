import { Box, Flex } from '@chakra-ui/react'
import { Redirect, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import storage, { setLogoutFunction } from 'library/utilities/storage'
import { useEffect, useState } from 'react'

import Accounts from 'main/views/Accounts'
import AuthRoute from 'library/components/AuthRoute'
import BetaWarning from 'library/components/BetaWarning'
import BottomNav from 'library/components/BottomNav'
import Header from 'library/components/Header'
import Invisible from 'library/components/Invisible'
import Loading from 'main/views/Loading'
import LoginPage from 'main/views/LoginPage'
import Menus from 'library/components/Menus'
import Modals from 'library/components/Modals'
import PrivateRoute from 'library/components/PrivateRoute'
import RegisterPage from 'main/views/RegisterPage'
import UseEffectComponent from 'library/components/UseEffectComponent'

const App: React.FC = () => {
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
	setLogoutFunction(setIsUserLoggedIn)

	/* If we instantly render Accounts, the popup will take significantly longer to initially open. */
	useEffect(() => {
		if (!storage.jwtToken) return
		setTimeout(() => setIsUserLoggedIn(true), 250)
	}, [])

	return (
		<Router>
			<UseEffectComponent />
			<BetaWarning />
			<Box height='100%' width='100vw' overflow='hidden' position='fixed'>
				<Flex h='full' w='full'>
					<Invisible invisible={!!storage.jwtToken && !isUserLoggedIn}>
						<Box display='flex' flexDirection='column' w='full'>
							<Invisible invisible={!storage.jwtToken || !isUserLoggedIn}>
								<Box flexShrink={0}>
									<Header />
								</Box>
							</Invisible>
							<Box
								bg='gray.800'
								p={{ base: '3', md: '4' }}
								pt={{ base: '2', md: '4' }}
								display='flex'
								flexDirection='column'
								flexGrow={1}
							>
								<Switch>
									<AuthRoute exact path='/login' component={LoginPage} props={{ setIsUserLoggedIn }} />
									<AuthRoute exact path='/register' component={RegisterPage} props={{ setIsUserLoggedIn }} />
									<PrivateRoute exact path='/accounts' component={Accounts} />
									<PrivateRoute exact path='/accounts/trash' component={Accounts} props={{ trash: true }} />
									<Route path='*'>
										<Redirect to='/accounts' />
									</Route>
								</Switch>
								<Invisible invisible={!storage.jwtToken || !isUserLoggedIn}>
									<Modals />
									<Menus />
								</Invisible>
							</Box>
							<BottomNav />
						</Box>
					</Invisible>
					<Invisible invisible={!storage.jwtToken || (!!storage.jwtToken && isUserLoggedIn)}>
						<Loading />
					</Invisible>
				</Flex>
			</Box>
		</Router>
	)
}

export default App