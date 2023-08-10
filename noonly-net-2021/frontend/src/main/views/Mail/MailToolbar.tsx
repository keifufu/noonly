import { Box, Checkbox, HStack } from '@chakra-ui/react'
import { Dispatch, RootState } from 'main/store/store'
import { memo, useMemo } from 'react'
import { MdArchive, MdDelete, MdDeleteForever, MdFileDownload, MdMarkunread, MdRefresh, MdRestore } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'

import { SelectionTypes } from '@types'
import Invisible from 'library/components/Invisible'
import { onSubmitProps } from 'library/components/Modals/modals/AlertModal'
import Pagination from 'library/components/Pagination'
import useIsMobile from 'library/hooks/useIsMobile'
import { PaginationProps } from 'library/hooks/usePagination'
import MailToolbarButton from './MailToolbarButton'

interface ExtendedPaginationProps extends PaginationProps {
	onPageChange: (page: number) => void
}

interface IProps {
	pageIds: string[],
	paginationProps: ExtendedPaginationProps
}

const MailToolbar: React.FC<IProps> = memo(({ pageIds, paginationProps }) => {
	const selection = useSelector((state: RootState) => state.selection.mail)
	const mail = useSelector((state: RootState) => state.mail)
	const user = useSelector((state: RootState) => state.user)
	const isIncoming = user.addresses?.find((address) => address.id === user.selectedAddress)?.incoming
	const dispatch: Dispatch = useDispatch()
	const isMobile = useIsMobile()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const selectedMail = useMemo(() => selection.map((id) => mail.find((mail) => mail.id === id)), [selection])
	const resetSelection = () => dispatch.selection.setSelection({ type: SelectionTypes.MAIL, ids: [] })

	return (
		<HStack
			spacing={1}
			rounded={{ base: 'none', md: 'lg' }}
			bg='gray.700'
			px='4'
			py='1'
			mt='-1'
			mb={{ base: '0', md: '3' }}
			boxShadow={{ base: '0px 8px 8px -2px rgba(0, 0, 0, 0.2);', md: 'none' }}
			zIndex={1}
		>
			<Checkbox
				isIndeterminate={selection.length > 0 && selection.length < pageIds.length}
				isChecked={selection.length > 0 && selection.length === pageIds.length}
				size='lg'
				mr='1'
				onChange={() => {
					selection.length > 0
						? resetSelection()
						: dispatch.selection.setSelection({ type: SelectionTypes.MAIL, ids: pageIds })
				}}
				marginLeft={{ base: '2.5', md: '0' }}
				marginRight={{ base: '4', md: '0' }}
			/>
			<Box flex='1'>
				<MailToolbarButton
					aria-label='Refresh'
					tooltip='Refresh'
					rIcon={MdRefresh}
					onClick={() => {
						dispatch.mail.refresh()
						resetSelection()
					}}
					showDot={isIncoming}
				/>
				<Invisible invisible={selection.length > 0}>
					<MailToolbarButton
						aria-label='Mark all as read'
						tooltip='Mark all as read'
						rIcon={MdMarkunread}
						onClick={() => {
							dispatch.mail.editRead({
								ids: mail.filter((mail) => mail.sentToAddressId === user.selectedAddress).map((mail) => mail.id),
								read: true
							})
							resetSelection()
						}}
					/>
				</Invisible>
				<Invisible invisible={selection.length === 0}>
					<Invisible visible={selectedMail.filter((mail) => !mail?.read).length > 0}>
						<MailToolbarButton
							aria-label='Mark as read'
							tooltip='Mark as read'
							rIcon={MdMarkunread}
							onClick={() => {
								dispatch.mail.editRead({
									ids: selection,
									read: true
								})
								resetSelection()
							}}
						/>
					</Invisible>
					<Invisible visible={selectedMail.filter((mail) => mail?.read).length === selection.length}>
						<MailToolbarButton
							aria-label='Mark as unread'
							tooltip='Mark as unread'
							rIcon={MdMarkunread}
							onClick={() => {
								dispatch.mail.editRead({
									ids: selection,
									read: false
								})
								resetSelection()
							}}
						/>
					</Invisible>
					<Invisible invisible={selectedMail.filter((mail) => mail?.archived).length > 0}>
						<MailToolbarButton
							aria-label='Archive'
							tooltip='Archive'
							rIcon={MdArchive}
							onClick={() => {
								dispatch.mail.editArchived({
									ids: selection,
									archived: true
								})
								resetSelection()
							}}
						/>
					</Invisible>
					<Invisible invisible={selectedMail.filter((mail) => mail?.archived).length === 0}>
						<MailToolbarButton
							aria-label='Unarchive'
							tooltip='Unarchive'
							rIcon={MdArchive}
							onClick={() => {
								dispatch.mail.editArchived({
									ids: selection,
									archived: false
								})
								resetSelection()
							}}
						/>
					</Invisible>
					<MailToolbarButton
						aria-label='Download'
						tooltip='Download'
						rIcon={MdFileDownload}
						onClick={() => {
							console.log('TODO', 'Mail Download')
						}}
					/>
					<Invisible invisible={selectedMail.filter((mail) => mail?.trash).length > 0}>
						<MailToolbarButton
							aria-label='Move to Trash'
							tooltip='Move to Trash'
							rIcon={MdDelete}
							onClick={() => {
								dispatch.mail.editTrash({
									ids: selection,
									trash: true
								})
								resetSelection()
							}}
						/>
					</Invisible>
					<Invisible invisible={selectedMail.filter((mail) => mail?.trash).length === 0}>
						<MailToolbarButton
							aria-label='Restore'
							tooltip='Restore'
							rIcon={MdRestore}
							onClick={() => {
								dispatch.mail.editTrash({
									ids: selection,
									trash: false
								})
								resetSelection()
							}}
						/>
						<MailToolbarButton
							alert
							aria-label='Delete'
							tooltip='Delete'
							rIcon={MdDeleteForever}
							onClick={() => {
								dispatch.modal.open({
									id: 9,
									data: {
										header: 'Delete Mail?',
										text: 'Are you sure you want to delete these Messages? You cannot undo this action afterwards.',
										buttons: ['Cancel', 'Delete'],
										onSubmit: ({ onSuccess: _onSuccess, onFail }: onSubmitProps) => {
											const onSuccess = () => {
												_onSuccess()
												resetSelection()
											}
											dispatch.mail.delete({ ids: selection, onSuccess, onFail })
										}
									}
								})
							}}
						/>
					</Invisible>
				</Invisible>
			</Box>
			<Invisible invisible={isMobile && selection.length > 0}>
				<Pagination
					alwaysVisible
					{...paginationProps}
				/>
			</Invisible>
		</HStack>
	)
})

export default MailToolbar