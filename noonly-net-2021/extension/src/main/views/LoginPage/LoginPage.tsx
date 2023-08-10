import { Box, Heading, Text } from '@chakra-ui/react'

import Card from 'library/components/Card'
import Link from 'library/components/Link'
import LoginForm from './LoginForm'
import Logo from 'library/components/Logo'

interface IProps {
	setIsUserLoggedIn: (value: boolean) => void
}

const LoginPage: React.FC<IProps> = ({ setIsUserLoggedIn }) => (
	<Box
		minH='100vh'
		overflowY='scroll'
		py={{ base: '3', md: '12' }}
		px={{ base: '0', md: '8' }}
	>
		<Box maxW='md' mx='auto'>
			<Logo mx='auto' h='8' mb={{ base: '10', md: '10' }} />
			<Heading textAlign='center' size='xl' fontWeight='extrabold'>
				Sign in to your account
			</Heading>
			<Text mt='4' mb='8' align='center' maxW='md' fontWeight={600}>
				<Text as='span'>Don&apos;t have an account?</Text>
				<Link to='/register'>Start free trial</Link>
			</Text>
			<Card>
				<LoginForm setIsUserLoggedIn={setIsUserLoggedIn} />
			</Card>
		</Box>
	</Box>
)

export default LoginPage