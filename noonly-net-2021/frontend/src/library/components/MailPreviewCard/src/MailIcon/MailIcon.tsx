import { memo, useState } from 'react'

import { Avatar } from '@chakra-ui/avatar'
import { SelectionTypes } from '@types'
import Skeleton from 'library/components/Skeleton'
import imgHost from 'library/utilities/imgHost'
import mergeClassNames from 'library/utilities/mergeClassNames'
import { Dispatch } from 'main/store/store'
import { MdCheck } from 'react-icons/md'
import { useDispatch } from 'react-redux'
import styles from './MailIcon.module.scss'

interface IProps {
	mail: Noonly.API.Data.Mail,
	isSelected: boolean
}

const MailIcon: React.FC<IProps> = memo(({ mail, isSelected }) => {
	const [imageLoaded, setImageLoaded] = useState(false)
	const dispatch: Dispatch = useDispatch()

	return (
		<div className={styles.root}>
			<Avatar
				opacity={isSelected ? '1' : '0'}
				position='absolute'
				rounded='xl'
				bg={'blue.300'}
				icon={<MdCheck size='32' />}
				transition='all linear 0.1s'
				onClick={() => dispatch.selection.toggleSelection({ type: SelectionTypes.MAIL, id: mail.id })}
			/>
			<Skeleton
				hasLoaded={imageLoaded}
				className={mergeClassNames(styles.skeleton, { [styles['skeleton-selected']]: isSelected })}
				onClick={() => dispatch.selection.toggleSelection({ type: SelectionTypes.MAIL, id: mail.id })}
			>
				<img
					className={styles.img}
					onLoad={() => setImageLoaded(true)}
					src={`${imgHost}/accounts/favicon?site=${mail.from.replace(/[<]+/g, '<').replace(/[>]+/g, '>').split('<')[1].split('@')[1].split('>')[0]}`}
					alt={mail.from.replace(/[<]+/g, '<').replace(/[>]+/g, '>').split('<')[1].split('@')[1].split('>')[0]}
				/>
			</Skeleton>
		</div>
	)
})

export default MailIcon