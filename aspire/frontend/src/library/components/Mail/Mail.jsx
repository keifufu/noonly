import { Avatar, Card, CardContent, CardHeader, Grid, Hidden, LinearProgress, makeStyles, Typography } from '@material-ui/core'
import { ArrowBack, MoreVert, Reply, Star, StarOutline } from '@material-ui/icons'
import relativeTime from 'dayjs/plugin/relativeTime'
import { connect, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useEffect, useState } from 'react'
import linkifyHtml from 'linkifyjs/html'
import { sanitize } from 'react-letter'
import dayjs from 'dayjs'

import MailAttachment from 'library/components/MailAttachment'
import IconButton from 'library/components/IconButton'
import socket from 'main/socket'

dayjs.extend(relativeTime)

const useStyles = makeStyles((theme) => ({
	card: {
		width: '100%'
	},
	subjectRoot: {
		display: 'flex',
		alignItems: 'top',
		padding: theme.spacing(1),
		[theme.breakpoints.up('sm')]: {
			alignItems: 'center'
		}
	},
	subject: {
		flex: '1 1 auto',
		marginLeft: theme.spacing(1),
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	action: {
		flex: '0 0 auto',
		alignSelf: 'flex-start',
		marginBottom: -4
	},
	header: {
		paddingTop: (props) => (props.isResponse ? 16 : 0)
	},
	content: {
		paddingBottom: '16px !important',
		display: 'flex',
		flexDirection: 'column',
		flex: '1 1 auto'
	},
	attachmentContainer: {
		margin: theme.spacing(2),
		marginTop: 0
	},
	attachments: {
		marginLeft: theme.spacing(3)
	},
	date: {
		marginRight: theme.spacing(1)
	},
	mailHTML: {
		backgroundColor: 'white !important',
		padding: theme.spacing(1, 2, 1, 2),
		color: 'black !important',
		borderRadius: 5,
		width: '100%'
	},
	loading: {
		borderRadius: 4
	}
}))

function Mail({ mail, isResponse, first, images, fetchImageAttachments, setFavorite }) {
	const classes = useStyles({ isResponse })
	const [expanded, setExpanded] = useState(!mail.replies)
	const attachments = mail.attachments?.filter((e) => !e.related)
	const isLoading = typeof mail.text !== 'string'
	const history = useHistory()

	/* Stupid fix to update mail after getting content fetched */
	// eslint-disable-next-line no-unused-vars
	const _mail = useSelector((state) => state.mail)

	useEffect(() => {
		if (isLoading)
			socket.emit('FETCH_MAIL_CONTENT', mail.id)
		if (!images[mail.id])
			fetchImageAttachments(mail)
	}, [fetchImageAttachments, images, isLoading, mail])

	useEffect(() => {
		const gmailQuotes = document.querySelectorAll('.gmail_quote')
		if (isResponse) gmailQuotes.forEach((quote) => quote.remove())
	}, [expanded, isResponse])

	const formatText = (_text) => {
		if (!_text) return 'Click to expand..'
		let text = _text
		text = text.replace(/\n/g, ' ')
		// eslint-disable-next-line prefer-destructuring
		if (text.includes('[image:')) text = text.split('[image:')[1].split(']')[1]
		return text
	}

	const sanitizedHtml = linkifyHtml(sanitize(mail.html || '', mail.text || '', {
		preserveCssPriority: true,
		allowedSchemas: ['http', 'https', 'mailto', 'cid'],
		rewriteExternalResources: (cid) => {
			if (images[mail.id]) {
				const img = images[mail.id].find((e) => `cid:${e.cid}` === cid)
				if (img) return img.data
			}
			return cid
		}
	}))

	return (
		<Card className={classes.card}>
			{!isResponse
				&& <div className={classes.subjectRoot}>
					<IconButton
						onClick={history.goBack}
						icon={ArrowBack}
						tooltip='Go Back'
						size={38}
					/>
					<div className={classes.subject}>
						<Typography variant='h5'>
							{ mail.subject || '(no subject)' }
						</Typography>
					</div>
					{/* <div className={classes.action}>
						<IconButton className={classes.iconButton}>
							<MoreVert />
						</IconButton>
					</div> */}
				</div>
			}
			{
				expanded ? (<>
					<CardHeader
						className={classes.header}
						avatar={<Avatar />}
						title={mail.from.name}
						titleTypographyProps={{
							style: { cursor: !first && 'pointer' },
							onClick: first ? null : () => setExpanded(!expanded)
						}}
						subheader={mail.from.email}
						subheaderTypographyProps={{
							style: { cursor: !first && 'pointer' },
							onClick: first ? null : () => setExpanded(!expanded)
						}}
						style={{ paddingBottom: 0 }}
						action={<>
							<Hidden xsDown>
								<Typography
									variant='body2'
									color='textSecondary'
									component='span'
									className={classes.date}
								>
									{ dayjs(Number(mail.date)).format('MMM DD YYYY[,] HH:mm') }
									{' '}
									({ dayjs(Number(mail.date)).fromNow() })
								</Typography>
								<IconButton
									className={classes.star}
									onClick={() => {
										setFavorite({
											ids: [mail.id],
											favorite: !mail.favorite
										})
									}}
									icon={ mail.favorite ? Star : StarOutline }
									tooltip={ mail.favorite ? 'Remove from Favorites' : 'Add to Favorites' }
									size={36}
								/>
								<IconButton icon={Reply} tooltip='Reply' size={36} />
							</Hidden>
							<IconButton icon={MoreVert} size={36} />
						</>}
					/>
					<CardContent className={classes.content}>
						{
							isLoading
								? <LinearProgress className={classes.loading} variant='indeterminate' />
								: <div className={classes.mailHTML} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
						}
					</CardContent>
					{ attachments?.length > 0
					&& <>
						<Typography variant='h6' className={classes.attachments}>
							Attachments
						</Typography>
						<Grid container spacing={1} className={classes.attachmentContainer}>
							{ attachments.map((attachment, i) => (
								<Grid item xs={8} sm={2} key={i}>
									<MailAttachment
										mailId={mail.id}
										attachment={attachment}
									/>
								</Grid>
							)) }
						</Grid>
					</>}
				</>) : (<>
					<CardHeader
						className={classes.header}
						avatar={<Avatar />}
						title={mail.from.name}
						titleTypographyProps={{
							style: { cursor: 'pointer' },
							onClick: () => setExpanded(!expanded)
						}}
						subheader={formatText(mail.text)}
						subheaderTypographyProps={{
							style: {
								cursor: 'pointer',
								overflow: 'hidden',
								whiteSpace: 'nowrap',
								textOverflow: 'ellipsis',
								marginRight: 8
							},
							onClick: () => setExpanded(!expanded)
						}}
						action={<>
							<Hidden xsDown>
								<Typography
									variant='body2'
									color='textSecondary'
									component='span'
									className={classes.date}
								>
									{ dayjs(Number(mail.date)).format('MMM DD YYYY[,] HH:mm') }
									({ dayjs(Number(mail.date)).fromNow() })
								</Typography>
							</Hidden>
							<IconButton
								className={classes.star}
								onClick={() => {
									setFavorite({
										ids: [mail.id],
										favorite: !mail.favorite
									})
								}}
								icon={ mail.favorite ? Star : StarOutline }
								tooltip={ mail.favorite ? 'Remove from Favorites' : 'Add to Favorites' }
								size={36}
							/>
						</>}
					/>
				</>)
			}
		</Card>
	)
}

const mapState = (state) => ({
	images: state.mail.images
})
const mapDispatch = (dispatch) => ({
	setFavorite: dispatch.mail.setFavorite,
	fetchImageAttachments: dispatch.mail.fetchImageAttachments
})
export default connect(mapState, mapDispatch)(Mail)