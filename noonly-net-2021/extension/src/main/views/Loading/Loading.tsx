import { Flex, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import Logo from 'library/components/Logo'

let interval: NodeJS.Timeout
let timesCalledInterval = 0

const Loading: React.FC = () => {
	const [dots, setDots] = useState('')

	useEffect(() => {
		interval = setInterval(() => {
			if (timesCalledInterval % 4 === 0) setDots('')
			else setDots((dots) => `${dots}.`)
			timesCalledInterval += 1
		}, 700)
		return () => clearInterval(interval)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Flex
			width='100%'
			alignItems='center'
			justifyContent='center'
		>
			<Stack spacing={4}>
				<Logo />
				<Text
					alignSelf='center'
					fontWeight={600}
					fontSize={24}
				>
					Loading{dots}
				</Text>
			</Stack>
		</Flex>
	)
}

export default Loading