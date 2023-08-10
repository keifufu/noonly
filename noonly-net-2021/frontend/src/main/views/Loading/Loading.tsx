import { useEffect, useState } from 'react'

import EmptyPageMessage from 'library/components/EmptyPageMessage'
import { Flex } from '@chakra-ui/react'

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
			<EmptyPageMessage text={`Loading${dots}`} />
		</Flex>
	)
}

export default Loading