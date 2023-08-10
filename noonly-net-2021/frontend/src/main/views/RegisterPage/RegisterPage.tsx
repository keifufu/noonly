import { Box, Heading, Text } from '@chakra-ui/react'

import Card from 'library/components/Card'
import Link from 'library/components/Link'
import Logo from 'library/components/Logo'
import RegisterForm from './RegisterForm'

const RegisterPage: React.FC = () => (
	<Box
		minH='100vh'
		overflowY='scroll'
		py={{ base: '3', md: '12' }}
		px={{ base: '0', md: '8' }}
	>
		<Box maxW='md' mx='auto'>
			<Logo mx='auto' h='8' mb={{ base: '10', md: '10' }} />
			<Heading textAlign='center' size='xl' fontWeight='extrabold'>
				Create a new account
			</Heading>
			<Text mt='4' mb='8' align='center' maxW='md' fontWeight={600}>
				<Text as='span'>Already have an account?</Text>
				<Link to='/login'>Sign in</Link>
			</Text>
			<Card>
				<RegisterForm />
			</Card>
		</Box>
	</Box>
)

export default RegisterPage