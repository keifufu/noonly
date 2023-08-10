import { Box, chakra, Collapse, Progress } from '@chakra-ui/react'
import { Dispatch, RootState } from 'main/store/store'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MdArrowBack, MdMarkunread, MdReply } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'

import Grid from '@bit/mui-org.material-ui.grid'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { sanitize } from 'lettersanitizer'
import useIsMobile from 'library/hooks/useIsMobile'
import linkifyHtml from 'linkifyjs/html'
import socket from 'main/socket'
import { BiRightArrowAlt } from 'react-icons/bi'
import { HiOutlineChevronDoubleDown } from 'react-icons/hi'
import IconButton from '../IconButton'
import Invisible from '../Invisible'
import MailAttachment from './MailAttachment'
import MailIcon from './MailIcon'

dayjs.extend(relativeTime)

interface IProps {
	mail: Noonly.API.Data.Mail,
	isReply?: boolean,
	isLatestReply?: boolean
}

interface LocationStateProps {
	fromPathname: string
}

const isLoaded = (mail: Noonly.API.Data.Mail) => typeof mail.html === 'string' && typeof mail.text === 'string'
const MailCard: React.FC<IProps> = ({ mail, isReply, isLatestReply }) => {
	const [isExtended, setIsExtended] = useState(isLatestReply ? true : !isReply)
	const attachments = mail.attachments?.filter((e) => !e.related)
	const addresses = useSelector((state: RootState) => state.user.addresses)
	const [isFetching, setIsFetching] = useState(!mail.html)
	const dispatch: Dispatch = useDispatch()
	const history = useHistory()
	const [frameHeight, setFrameHeight] = useState(0)
	const isMobile = useIsMobile()
	const location = useLocation()
	const locationState = location.state as LocationStateProps
	const appLoaded = useSelector((state: RootState) => state.initialLoad.app)

	const _resizeAttempt = useRef<NodeJS.Timeout | null>(null)

	const handleFrameResize = useCallback(() => {
		const iframe: null | HTMLIFrameElement = document.getElementById('mail-iframe') as HTMLIFrameElement | null
		if (!iframe) return
		const body = iframe.contentWindow?.document.body
		if (!body) return

		/* Attach font stylesheet */
		/*
		 * const cssLink = document.createElement('link')
		 * cssLink.href = 'https://fonts.googleapis.com/css?family=Roboto:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900italic,900'
		 * cssLink.rel = 'stylesheet'
		 * iframe.contentWindow?.document.head.appendChild(cssLink)
		 * body.style.fontFamily = 'Roboto'
		 * body.style.fontSize = '16px'
		 * body.style.overflow = 'hidden'
		 */

		/* Set correct attributes for links */
		const elements = body.getElementsByTagName('a')
		for (let i = 0; i < elements.length; i++) {
			elements[i].setAttribute('target', '_blank')
			elements[i].setAttribute('rel', 'noopener noreferrer')
		}

		/* Set proper height */
		const height = iframe?.contentDocument?.documentElement?.scrollHeight ?? 0
		if (height !== 0) {
			setFrameHeight(height)
			if (_resizeAttempt.current)
				clearTimeout(_resizeAttempt.current)
		}
	}, [])

	const toggleExtended = (fromBox: boolean) => {
		if (isExtended && fromBox) return
		setIsExtended(!isExtended)
	}

	useEffect(() => {
		_resizeAttempt.current = setInterval(() => {
			handleFrameResize()
		}, 250)
		return () => {
			if (_resizeAttempt.current)
				clearTimeout(_resizeAttempt.current)
		}
	}, [handleFrameResize])

	useEffect(() => {
		if (!mail.read)
			dispatch.mail.editRead({ ids: [mail.id], read: true, notification: false })
		if (isLoaded(mail) && isFetching) {
			return setIsFetching(false)
		} else if (!isLoaded(mail) && isExtended) {
			/* Let open animation finish */
			setTimeout(() => {
				socket.emit('LOAD_MAIL_CONTENT', { id: mail.id })
			}, 250)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appLoaded, mail.html, mail.text, isExtended])

	const sanitizedHtml = linkifyHtml(sanitize(mail.html || '', mail.text || '', {
		preserveCssPriority: true,
		allowedSchemas: ['http', 'https', 'mailto', 'cid'],
		rewriteExternalResources: (cid) => {
			if (!mail.images || !Array.isArray(mail.images)) return cid
			const img = mail.images.find((e) => `cid:${e.cid}` === cid)
			if (img) return img.data
			return cid
		}
	}), {
		target: '_blank'
	})

	return (
		<Box
			rounded='lg'
			bg='gray.700'
			shadow='base'
			pt='3'
			pb='3'
			px='4'
		>
			<Invisible invisible={isReply}>
				<Box
					display='flex'
					alignItems='center'
				>
					<IconButton
						aria-label='Go Back'
						tooltip='Go Back'
						alignSelf='flex-start'
						icon={<MdArrowBack size='20' />}
						variant='ghost'
						onClick={() => history.push(locationState?.fromPathname || '/mail/inbox')}
					/>
					<Box
						fontWeight={600}
						fontSize='lg'
						flex='1'
						ml='3'
					>
						{mail.subject}
					</Box>
				</Box>
			</Invisible>
			<Box
				display='flex'
				pt={isReply ? undefined : '3'}
				cursor={isExtended ? undefined : 'pointer'}
				onClick={() => toggleExtended(true)}
			>
				<MailIcon mail={mail} />
				<Box
					flex='1'
					display='flex'
					flexDir='column'
					overflow='hidden'
					whiteSpace='nowrap'
				>
					<Box>
						<Box fontWeight={600} display='inline'>
							{mail.from.replace(/[<]+/g, '<').replace(/[>]+/g, '>').split('<')[0]}
						</Box>
						<Invisible invisible={!isMobile}>
							<BiRightArrowAlt style={{ display: 'inline' }} />
							<Box display='inline' ml='1' color='gray.300'>
								{addresses?.find((address) => address.id === mail.sentToAddressId)?.address}
							</Box>
						</Invisible>
						<Box fontSize={{ base: 14, md: 16 }} display={{ base: 'block', md: 'inline' }} color='gray.300'>
							{'<'}{mail.from.replace(/[<]+/g, '<').replace(/[>]+/g, '>').split('<')[1].split('>')[0]}{'>'}
						</Box>
					</Box>
					<Invisible invisible={isMobile}>
						<Box>
							<Box display='inline'>
								To: {' '}
							</Box>
							<Box display='inline' color='gray.300'>
								{addresses?.find((address) => address.id === mail.sentToAddressId)?.address}@{process.env.REACT_APP_HOSTNAME}
							</Box>
						</Box>
					</Invisible>
				</Box>
				<Invisible invisible={isMobile}>
					<Box
						mr='1'
						ml='auto'
						display='flex'
						alignItems='center'
					>
						<Box
							color='gray.300'
							whiteSpace='nowrap'
						>
							{dayjs(mail.dateSent).format('MMM DD YYYY[,] HH:mm')}
							{' '}
							({ dayjs(mail.dateSent).fromNow() })
						</Box>
						<Box ml='2'>
							<IconButton
								aria-label='Reply'
								tooltip='Reply'
								placement='top'
								disabled={isFetching || !isExtended}
								variant='ghost'
								icon={<MdReply size='20' />}
							/>
							<IconButton
								aria-label={mail.read ? 'Mark as unread' : 'Mark as read'}
								tooltip={mail.read ? 'Mark as unread' : 'Mark as read'}
								disabled={isFetching || !isExtended}
								variant='ghost'
								icon={<MdMarkunread size='20' />}
								onClick={() => {
									dispatch.mail.editRead({ ids: [mail.id], read: !mail.read })
								}}
							/>
							<IconButton
								aria-label={isExtended ? 'Collapse' : 'Expand'}
								tooltip={isExtended ? 'Collapse' : 'Expand'}
								variant='ghost'
								icon={
									<Box
										as={HiOutlineChevronDoubleDown}
										transition='transform 0.15s linear'
										transform={`rotate(${isExtended ? '-180' : '0'}deg)`}
										flexShrink={0}
										size='20'
									/>
								}
								onClick={() => setIsExtended(!isExtended)}
							/>
						</Box>
					</Box>
				</Invisible>
			</Box>
			<Collapse in={isExtended} animateOpacity>
				{isFetching ? (
					<Progress isIndeterminate rounded='md' mt='3' />
				) : (<>
					<Box
						bg='white'
						color='black'
						rounded='md'
						mt='3'
						pt='1'
						px='1'
						mb={(attachments?.length || 0) > 0 ? '3' : undefined}
						userSelect='none'
					>
						<Invisible invisible={isMobile}>
							<iframe
								id='mail-iframe'
								style={{ height: frameHeight, width: '100%' }}
								onLoad={handleFrameResize}
								srcDoc={sanitizedHtml}
								title={mail.subject}
							/>
						</Invisible>
						<Invisible invisible={!isMobile}>
							<chakra.div height={frameHeight / 2} width='100%' overflow='hidden'>
								<iframe
									id='mail-iframe'
									style={{ height: '200%', width: '200%', transform: 'scale(0.5)', transformOrigin: '0 0' }}
									onLoad={handleFrameResize}
									srcDoc={sanitizedHtml}
									title={mail.subject}
								/>
							</chakra.div>
						</Invisible>
					</Box>
					<Invisible visible={(attachments?.length || 0) > 0}>
						<Grid container spacing={1}>
							{attachments?.map((attachment) => (
								<Grid item xs={12} md={3} key={attachment.id}>
									<MailAttachment
										mailId={mail.id}
										attachment={attachment}
									/>
								</Grid>
							))}
						</Grid>
					</Invisible>
				</>)}
			</Collapse>
		</Box>
	)
}

export default MailCard