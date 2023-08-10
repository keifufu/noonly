import { memo, useEffect, useRef, useState } from 'react'
import { FiMoreVertical } from 'react-icons/fi'
import { MdCheck, MdEdit } from 'react-icons/md'

import Collapsible from 'library/components/Collapsible'
import Textarea from 'library/components/Textarea'
import useIsMobile from 'library/hooks/useIsMobile'
import decrypt from 'library/utilities/decrypt'
import { Dispatch } from 'main/store/store'
import { useDispatch } from 'react-redux'
import Divider from '../Divider'
import IconButton from '../IconButton'
import Invisible from '../Invisible'
import styles from './AccountCard.module.scss'
import AccountIcon from './AccountIcon'

interface IProps {
	account: Noonly.API.Data.Account
}

const AccountCard: React.FC<IProps> = memo(({ account }) => {
	const [extended, setExtended] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const dispatch: Dispatch = useDispatch()
	const editRef = useRef<HTMLTextAreaElement | null>(null)
	const note = decrypt(account.note)
	const isMobile = useIsMobile()

	const resizeArea = () => {
		if (!editRef.current) return
		if (editRef.current.value.length === 0) {
			editRef.current.style.height = '40px'
			return
		}
		editRef.current.style.height = 'auto'
		editRef.current.style.height = `${editRef.current.scrollHeight}px`
	}

	useEffect(() => {
		resizeArea()
	}, [isEditing])

	const getAccountInfoText = () => (
		account.address && account.username
			? `${account.address} - ${account.username}`
			: account.address
				?	account.address
				: account.username
					? account.username
					: ''
	)

	return (
		<div className={styles.root}>
			<div
				className={styles['root-inner']}
				onClick={() => setExtended(!extended)}
				onContextMenu={(e) => dispatch.contextMenu.open({ id: 1, e, data: account })}
			>
				<AccountIcon account={account} />
				<div>
					<div className={styles['account-site']} onClick={(e) => !isMobile && e.stopPropagation()}>
						{account.site}
					</div>
					<div className={styles['account-info']} onClick={(e) => !isMobile && e.stopPropagation()}>
						{getAccountInfoText()}
					</div>
				</div>
				<Invisible visible={isMobile}>
					<IconButton
						aria-label='Open Menu'
						tooltip='Open Menu'
						placement='left'
						onClick={(e) => {
							e.stopPropagation()
							dispatch.contextMenu.open({ id: 1, e, data: account })
						}}
						icon={<FiMoreVertical size={20} />}
						size='sm'
						style={{ marginLeft: 'auto' }}
					/>
				</Invisible>
			</div>
			<Collapsible open={extended}>
				<div className={styles['collapsed-root']}>
					<Divider className={styles['collapsed-divider']} />
					<div className='flex'>
						{
							isEditing ? (
								<IconButton
									aria-label='Save Note'
									tooltip='Save Note'
									placement='left'
									disabled={isLoading}
									isLoading={isLoading}
									onClick={() => {
										if (editRef.current?.value === note)
											return setIsEditing(false)
										setIsLoading(true)
										dispatch.accounts.editNote({
											id: account.id,
											note: editRef.current?.value || '',
											onSuccess: () => {
												setIsEditing(false)
												setIsLoading(false)
											}
										})
									}}
									icon={<MdCheck size='20' />}
									size='sm'
								/>
							) : (
								<IconButton
									aria-label='Edit Note'
									tooltip='Edit Note'
									placement='left'
									onClick={() => setIsEditing(true)}
									icon={<MdEdit />}
									size='sm'
								/>
							)
						}
						<div className={styles['note-container']}>
							{
								isEditing ? (
									<Textarea
										onInput={resizeArea}
										ref={editRef}
										defaultValue={note}
										placeholder='Write a Note'
										className={styles.textarea}
									/>
								) : (
									note || '<No Note>'
								)
							}
						</div>
					</div>
				</div>
			</Collapsible>
		</div>
	)
})

export default AccountCard