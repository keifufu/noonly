import { useEffect, useState } from 'react'

import { Box } from '@chakra-ui/layout'
import { Collapse } from '@chakra-ui/react'
import Invisible from '../Invisible'
import devBuild from 'library/utilities/devBuild'

const BetaWarning: React.FC = () => {
	const isBeta = location.host === 'beta.noonly.net' || devBuild
	const [isExtended, setIsExtended] = useState(true)
	useEffect(() => {
		setTimeout(() => {
			setIsExtended(false)
		}, 5000)
	}, [])
	if (!isBeta) return null

	return (
		<Box
			position='fixed'
			top='0px'
			left='0px'
			width='100%'
			zIndex='9999999999'
		>
			<Invisible invisible={isExtended}>
				<Box
					height='5px'
					bg='orange.600'
					roundedBottom='md'
					cursor='pointer'
					onClick={() => setIsExtended(!isExtended)}
				/>
			</Invisible>
			<Collapse in={isExtended} onClick={() => setIsExtended(!isExtended)} animateOpacity>
				<Box
					p='3'
					roundedBottom='md'
					bg='orange.600'
					cursor='pointer'
					userSelect='none'
					onClick={() => setIsExtended(!isExtended)}
				>
					This is a {devBuild ? 'Development' : 'Beta'} build. Any action taken on this version might be reverted.
				</Box>
			</Collapse>
		</Box>
	)
}

export default BetaWarning