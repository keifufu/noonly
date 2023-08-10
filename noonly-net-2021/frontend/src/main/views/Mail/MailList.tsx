import { Dispatch, RootState } from 'main/store/store'
import MailPreviewCard, { MailPreviewCardSkeleton } from 'library/components/MailPreviewCard'
import { memo, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import EmptyPageMessage from 'library/components/EmptyPageMessage'
import Invisible from 'library/components/Invisible'
import MailCard from 'library/components/MailCard'
import { SelectionTypes } from '@types'
import { Stack } from '@chakra-ui/layout'
import { useHistory } from 'react-router'

const getChildren = (allMail: Noonly.State.Mail, parentMail: Noonly.API.Data.Mail): Noonly.API.Data.Mail[] => {
	const foundChildren: Noonly.API.Data.Mail[] = []
	const children = allMail.filter((mail) => mail.inReplyTo === parentMail.messageId)
	if (children.length === 0) return []
	children.forEach((c) => {
		foundChildren.push(c)
	})
	children.forEach((c) => {
		getChildren(allMail, c).forEach((nc) => foundChildren.push(nc))
	})
	return foundChildren
}

interface IProps {
	hasLoaded: boolean,
	allMail: Noonly.API.Data.Mail[],
	pageMail: Noonly.API.Data.Mail[],
	archived: boolean,
	trash: boolean,
	sent: boolean,
	mailId?: string,
	page: number
}

const MailList: React.FC<IProps> = memo(({ hasLoaded, allMail, pageMail, archived, trash, sent, mailId, page }) => {
	const selection = useSelector((state: RootState) => state.selection.mail)
	const dispatch: Dispatch = useDispatch()
	const history = useHistory()

	useEffect(() => {
		dispatch.selection.setSelection({ type: SelectionTypes.MAIL, ids: [] })
	}, [archived, trash, sent, dispatch.selection, page])

	const mapView = useCallback(() => {
		if (!hasLoaded) return
		const viewingMail = allMail.find((mail) => mail.id === mailId)
		if (!viewingMail) return history.push('/mail/inbox')
		const children = getChildren(allMail, viewingMail).sort((a, b) => Date.parse(a.dateReceived) - Date.parse(b.dateReceived))
		const latestChild = children[children.length - 1]
		return (<>
			<MailCard mail={viewingMail} />
			{children.map((child) => (
				<MailCard isReply isLatestReply={latestChild.id === child.id} mail={child} key={child.id} />
			))}
		</>)
	}, [hasLoaded, allMail, history, mailId])

	return (<>
		<Invisible visible={!trash && !archived && !sent && pageMail.length === 0 && hasLoaded && !mailId}>
			<EmptyPageMessage text='Your Inbox is empty' />
		</Invisible>
		<Invisible visible={!!archived && pageMail.length === 0 && hasLoaded && !mailId}>
			<EmptyPageMessage text='You have no archived Mail' />
		</Invisible>
		<Invisible visible={!!trash && pageMail.length === 0 && hasLoaded && !mailId}>
			<EmptyPageMessage text='Your Trash is empty' />
		</Invisible>
		<Invisible visible={!!sent && pageMail.length === 0 && hasLoaded && !mailId}>
			<EmptyPageMessage text='You have sent no Mail' />
		</Invisible>
		<Stack spacing={{ base: 0, md: 2 }}>
			<Invisible invisible={hasLoaded}>
				{Array(14).fill(0).map((e, i) => (
					<MailPreviewCardSkeleton key={i} />
				))}
			</Invisible>
			{
				mailId ? (
					mapView()
				) : (
					pageMail.map((mail) => {
						const children = getChildren(allMail, mail)
						return (
							<MailPreviewCard
								amountOfReplies={children.length}
								mail={mail}
								isSelected={selection.includes(mail.id)}
								key={mail.id}
							/>
						)
					})
				)
			}
		</Stack>
	</>)
})

export default MailList