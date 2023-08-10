import { Box, Flex } from '@chakra-ui/react'
import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useLocation } from 'react-router-dom'

import AuthRoute from 'library/components/AuthRoute'
import BetaWarning from 'library/components/BetaWarning'
import BottomNav from 'library/components/BottomNav'
import DisconnectWarning from 'library/components/DisconnectWarning/DisconnectWarning'
import Header from 'library/components/Header'
import Invisible from 'library/components/Invisible'
import PrivateRoute from 'library/components/PrivateRoute'
import Wrapper from 'library/components/Sidebar/wrapper'
import UseEffectComponent from 'library/components/UseEffectComponent'
import useIsMobile from 'library/hooks/useIsMobile'
import devBuild from 'library/utilities/devBuild'
import storage from 'library/utilities/storage'
import { RootState } from 'main/store/store'
import Homepage from 'main/views/Homepage/Homepage'
import Loading from 'main/views/Loading'
import NotImplemented from 'main/views/NotImplemented'
import { useSelector } from 'react-redux'

const LoginPage = lazy(() => import('main/views/LoginPage'))
const RegisterPage = lazy(() => import('main/views/RegisterPage'))
const Mail = lazy(() => import('main/views/Mail'))
const Accounts = lazy(() => import('main/views/Accounts'))
const Screenshots = lazy(() => import('main/views/Screenshots'))
const Cloud = lazy(() => import('main/views/Cloud'))
const Sidebar = lazy(() => import('library/components/Sidebar'))
const Overlays = lazy(() => import('library/components/Overlays'))
const Modals = lazy(() => import('library/components/Modals'))
const Menus = lazy(() => import('library/components/Menus'))

const App: React.FC = () => {
	const hasLoaded = useSelector((state: RootState) => state.initialLoad.app)
	const location = useLocation()
	const isMobile = useIsMobile()

	return (<>
		<UseEffectComponent />
		<BetaWarning />
		<DisconnectWarning isDisconnected={hasLoaded === 'DISCONNECTED'} />
		<Box height='100%' width='100vw' overflow='hidden' position='fixed'>
			<Flex h='full' w='full'>
				<Invisible invisible={!storage.jwtToken || !hasLoaded}>
					<Suspense fallback={null}>
						<Invisible invisible={isMobile}>
							<Sidebar />
						</Invisible>
						<Wrapper />
					</Suspense>
				</Invisible>
				<Invisible invisible={!!storage.jwtToken && !hasLoaded}>
					<Box display='flex' flexDirection='column' w='full'>
						<Invisible invisible={!storage.jwtToken || !hasLoaded}>
							<Box flexShrink={0}>
								<Header />
							</Box>
						</Invisible>
						<Box
							bg='gray.800'
							p={{ base: '0', md: '4' }}
							pt={{ base: '0', md: '4' }}
							// pb={{ base: '2', md: '0' }}
							display='flex'
							flexDirection='column'
							flexGrow={1}
						>
							<Switch location={location} key={location.pathname}>
								<AuthRoute exact path='/login' component={LoginPage} />
								<AuthRoute exact path='/register' component={RegisterPage} />
								<PrivateRoute exact path='/mail/inbox/:page?' component={Mail} />
								<PrivateRoute exact path='/mail/archived/:page?' component={Mail} props={{ archived: true }} />
								<PrivateRoute exact path='/mail/trash/:page?' component={Mail} props={{ trash: true }} />
								<PrivateRoute exact path='/mail/sent' component={Mail} props={{ sent: true }} />
								<PrivateRoute exact path='/mail/view/:mailId' component={Mail}/>
								<PrivateRoute exact path='/accounts' component={Accounts} />
								<PrivateRoute exact path='/accounts/trash' component={Accounts} props={{ trash: true }} />
								<PrivateRoute exact path='/screenshots' component={Screenshots} />
								<PrivateRoute exact path='/screenshots/favorite' component={Screenshots} props={{ favorite: true }} />
								<PrivateRoute exact path='/screenshots/trash' component={Screenshots} props={{ trash: true }} />
								<PrivateRoute exact path='/cloud/user/:parentId?' component={devBuild ? Cloud : NotImplemented} />
								<PrivateRoute exact path='/cloud/shared/:parentId?' component={devBuild ? Cloud : NotImplemented} props={{ shared: true }} />
								<PrivateRoute exact path='/cloud/trash/:parentId?' component={devBuild ? Cloud : NotImplemented} props={{ trash: true }} />
								<PrivateRoute exact path='/chat' component={NotImplemented} />
								<PrivateRoute exact path='/urls' component={NotImplemented} />
								<PrivateRoute exact path='/convert' component={NotImplemented} />
								<PrivateRoute exact path='/calendar' component={NotImplemented} />
								<PrivateRoute exact path='/home' component={Homepage} />
								<Route path='*'>
									<Redirect to='/mail/inbox' />
								</Route>
							</Switch>
							<Invisible invisible={!storage.jwtToken || !hasLoaded}>
								<Suspense fallback={null}>
									<Overlays />
									<Modals />
									<Menus />
								</Suspense>
							</Invisible>
						</Box>
						<BottomNav />
					</Box>
				</Invisible>
				<Invisible invisible={!storage.jwtToken || (!!storage.jwtToken && !!hasLoaded)}>
					<Loading />
				</Invisible>
			</Flex>
		</Box>
	</>)
}

export default App