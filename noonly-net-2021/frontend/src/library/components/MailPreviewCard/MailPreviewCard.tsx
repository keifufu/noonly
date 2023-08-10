import { Checkbox } from '@chakra-ui/react'
import { memo, useCallback } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { SelectionTypes } from '@types'
import useIsMobile from 'library/hooks/useIsMobile'
import mergeClassNames from 'library/utilities/mergeClassNames'
import store from 'main/store'
import { Dispatch } from 'main/store/store'
import { useDispatch } from 'react-redux'
import styles from './MailPreviewCard.module.scss'
import MailContent from './src/MailContent'
import MailIcon from './src/MailIcon/MailIcon'

interface IProps {
	mail: Noonly.API.Data.Mail,
	amountOfReplies: number,
	isSelected: boolean
}

const MailPreviewCard: React.FC<IProps> = memo(({ mail, amountOfReplies, isSelected }) => {
	const dispatch: Dispatch = useDispatch()
	const isMobile = useIsMobile()
	const location = useLocation()
	const history = useHistory()

	const viewMail = useCallback(() =>
		history.push({ pathname: `/mail/view/${mail.id}`, state: { headerText: mail.subject, fromPathname: location.pathname } }),
	[history, location.pathname, mail.id, mail.subject])

	const getSenderName = () => {
		if (mail.sentFromAddressId) {
			const { addresses } = store.getState().user
			return addresses?.find((address) => address.id === mail.sentFromAddressId)?.address
		} else if (mail.from) {
			return mail.from.split('<')[0]
		}
	}

	const onContextMenu = (e: any) => {
		const selection = store.getState().selection.mail
		dispatch.selection.setSelection({ type: SelectionTypes.MAIL, ids: selection.includes(mail.id) ? selection : [mail.id] })
		dispatch.contextMenu.open({ id: 3, e, data: mail })
	}

	return (
		<div
			className={styles.root}
			onContextMenu={onContextMenu}
			onClick={viewMail}
		>
			<div className={mergeClassNames(styles['root-inner'], { [styles['root-inner-selected']]: isSelected, [styles['root-inner-unread']]: !mail.read })}>
				<div className='flex'>
					<div className='flex flex-shrink-0' onClick={(e) => e.stopPropagation()}>
						{isMobile ? (
							<MailIcon mail={mail} isSelected={isSelected} />
						) : (
							<Checkbox
								isChecked={isSelected}
								onChange={() => dispatch.selection.toggleSelection({ type: SelectionTypes.MAIL, id: mail.id })}
							/>
						)}
					</div>
					<MailContent getSenderName={getSenderName} subject={mail.subject} content={mail.previewText} date={mail.dateSent} read={mail.read} />
				</div>
			</div>
		</div>
	)
})

export default MailPreviewCard