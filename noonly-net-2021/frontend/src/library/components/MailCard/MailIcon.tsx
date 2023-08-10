import { memo, useState } from 'react'

import { Img } from '@chakra-ui/image'
import { Skeleton } from '@chakra-ui/skeleton'
import imgHost from 'library/utilities/imgHost'

interface IProps {
	mail: Noonly.API.Data.Mail
}

const MailIcon: React.FC<IProps> = memo(({ mail }) => {
	const [imageLoaded, setImageLoaded] = useState(false)

	return (
		<Skeleton rounded='xl' h='12' w='12' mr='3' isLoaded={imageLoaded}>
			<Img
				onLoad={() => setImageLoaded(true)}
				w='12'
				h='12'
				rounded='xl'
				transition='all linear 0.1s'
				objectFit='cover'
				src={`${imgHost}/accounts/favicon?site=${mail.from.replace(/[<]+/g, '<').replace(/[>]+/g, '>').split('<')[1].split('@')[1].split('>')[0]}`}
				alt={mail.from.replace(/[<]+/g, '<').replace(/[>]+/g, '>').split('<')[1].split('@')[1].split('>')[0]}
				mr='3'
			/>
		</Skeleton>
	)
})

export default MailIcon