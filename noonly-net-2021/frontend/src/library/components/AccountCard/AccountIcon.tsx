import { memo, useState } from 'react'

import { Dispatch } from 'main/store/store'
import Skeleton from 'library/components/Skeleton'
import imgHost from 'library/utilities/imgHost'
import styles from './AccountIcon.module.scss'
import { useDispatch } from 'react-redux'

interface IProps {
	account: Noonly.API.Data.Account
}

const AccountIcon: React.FC<IProps> = memo(({ account }) => {
	const [imageLoaded, setImageLoaded] = useState(false)
	const dispatch: Dispatch = useDispatch()
	const iconUrl = account.icon ? `${imgHost}/icon/${account.icon}` : `${imgHost}/accounts/favicon?site=${account.site}`

	return (
		<Skeleton className={styles.skeleton} hasLoaded={imageLoaded}>
			<img
				onLoad={() => setImageLoaded(true)}
				onClick={(e) => {
					e.stopPropagation()
					dispatch.modal.open({ id: 6, data: account })
				}}
				src={iconUrl}
				alt={account.site}
				className={styles.image}
			/>
		</Skeleton>
	)
})

export default AccountIcon