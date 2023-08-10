import { memo, useState } from 'react'

import { Dispatch } from 'main/store/store'
import { Img } from '@chakra-ui/image'
import { Skeleton } from '@chakra-ui/skeleton'
import imgHost from 'library/utilities/imgHost'
import { useDispatch } from 'react-redux'

interface IProps {
	account: Noonly.API.Data.Account
}

const AccountIcon: React.FC<IProps> = memo(({ account }) => {
	const [imageLoaded, setImageLoaded] = useState(false)
	const dispatch: Dispatch = useDispatch()
	const iconUrl = account.icon ? `${imgHost}/icon/${account.icon}` : `${imgHost}/accounts/favicon?site=${account.site}`

	return (
		<Skeleton rounded='xl' h='12' w='12' mr='4' isLoaded={imageLoaded}>
			<Img
				onLoad={() => setImageLoaded(true)}
				onClick={(e) => {
					e.stopPropagation()
					dispatch.modal.open({ id: 6, data: account })
				}}
				w='12'
				h='12'
				rounded='xl'
				transition='all linear 0.1s'
				_hover={{ transform: 'scale(1.05)' }}
				objectFit='cover'
				src={iconUrl}
				alt={account.site}
				mr='4'
			/>
		</Skeleton>
	)
})

export default AccountIcon