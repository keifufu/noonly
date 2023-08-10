import { Box, Collapse, Divider, Textarea } from '@chakra-ui/react'
import { MdCheck, MdEdit } from 'react-icons/md'
import { memo, useEffect, useRef, useState } from 'react'

import AccountIcon from './AccountIcon'
import { Dispatch } from 'main/store/store'
import IconButton from '../IconButton'
import decrypt from 'library/utilities/decrypt'
import { useDispatch } from 'react-redux'

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

	return (
		<Box
			userSelect='none'
			bg='gray.700'
			shadow='base'
			rounded='lg'
		>
			<Box
				display='flex'
				onClick={() => setExtended(!extended)}
				onContextMenu={(e) => dispatch.contextMenu.open({ id: 1, e, data: account })}
				cursor='pointer'
				px='3'
				py='2'
				transition='all 0.2s'
				alignItems='center'
			>
				<AccountIcon account={account} />
				<Box flex='1'>
					<Box cursor='text' onClick={(e) => e.stopPropagation()} userSelect='text' width='fit-content' flex='1' fontSize={16} fontWeight={600}>
						{account.site}
					</Box>
					<Box cursor='text' onClick={(e) => e.stopPropagation()} userSelect='text' width='fit-content' flex='1' fontSize={16} color='gray.300'>
						{
							account.address && account.username
								? `${account.address} - ${account.username}`
								: account.address
									?	account.address
									: account.username
										? account.username
										: ''}
					</Box>
				</Box>
			</Box>
			<Collapse in={extended} animateOpacity>
				<Box mb='3' px='4'>
					<Divider pb='1' mb='2' />
					<Box display='flex'>
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
						<Box userSelect='text' ml='3' display='flex' alignItems='center' flex='1' whiteSpace='pre-wrap'>
							{
								isEditing ? (
									<Textarea
										resize='none'
										minHeight='40px'
										onInput={resizeArea}
										variant='filled'
										ref={editRef}
										defaultValue={note}
										placeholder='Write a Note'
									/>
								) : (
									note || '<No Note>'
								)
							}
						</Box>
					</Box>
				</Box>
			</Collapse>
		</Box>
	)
})

export default AccountCard