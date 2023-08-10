import { Avatar, Card, CardHeader, Checkbox, fade, Hidden, makeStyles, Typography } from '@material-ui/core'
import { Check, MoreVert, Person, Star, StarOutline } from '@material-ui/icons'
import { useHistory } from 'react-router'
import { connect } from 'react-redux'
import { useRef } from 'react'
import dayjs from 'dayjs'

import IconButton from 'library/components/IconButton'

const useStyles = makeStyles((theme) => ({
	card: {
		border: (props) => `solid 1px ${props.selected ? theme.palette.primary.main : theme.palette.background.paper}`,
		backgroundColor: (props) => props.selected && fade(theme.palette.common.white, 0.1),
		transition: '0.05s all ease-in-out',
		cursor: 'pointer',
		userSelect: 'none',
		[theme.breakpoints.up('sm')]: {
			'&:hover': {
				backgroundColor: fade(theme.palette.common.white, 0.1)
			}
		}
	},
	root: {
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing(0.7)
	},
	content: {
		display: 'flex',
		flex: '1 1 auto',
		overflow: 'hidden'
	},
	from: {
		flexBasis: '15%',
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
		paddingRight: theme.spacing(2),
		fontWeight: (props) => !props.isread && 'bold'
	},
	mobileTitle: {
		fontWeight: (props) => !props.isread && 'bold'
	},
	mobileSubject: {
		fontWeight: (props) => !props.isread && 'bold'
	},
	textWrapper: {
		display: 'flex',
		overflow: 'hidden',
		flexBasis: '85%',
		paddingRight: theme.spacing(2),
		alignItems: 'center'
	},
	subject: {
		paddingRight: 4,
		fontWeight: (props) => !props.isread && 'bold'
	},
	text: {
		flexShrink: 999999999,
		fontWeight: (props) => !props.isread && 'bold'
	},
	startAction: {
		flex: '0 0 auto',
		alignSelf: 'flex-start',
		marginRight: 8
	},
	action: {
		flex: '0 0 auto',
		alignSelf: 'flex-start',
		display: 'flex',
		alignItems: 'center',
		marginTop: 2
	},
	mobileAction: {
		flex: '0 0 auto',
		alignSelf: 'flex-start',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-end',
		marginTop: 4
	},
	star: {
		float: 'right',
		padding: 0,
		marginTop: theme.spacing(1)
	},
	date: {
		whiteSpace: 'nowrap',
		fontWeight: (props) => !props.isread && 'bold',
		color: (props) => !props.isread && 'white',
		[theme.breakpoints.up('sm')]: {
			marginRight: theme.spacing(1)
		}
	},
	mobileAvatar: {
		backgroundColor: (props) => props.selected && theme.palette.primary.main,
		transition: '0.3s all ease-in-out'
	}
}))

let holdTimeout = null
let touchedElement = null
let clickInvincibility = false
function MailPreview({ mail, selected, selection, setRead, setFavorite, toggleSelection, setSelection, openContextMenu }) {
	const classes = useStyles({ isread: mail.isread, selected })
	const moreVertButtonRef = useRef()
	const history = useHistory()

	const onDoubleClick = () => {
		if (clickInvincibility) return
		setSelection([])
		history.push(`/inbox/${mail.id}`)
		if (!mail.isread)
			setRead({ ids: [mail.id], read: true, notification: false })
	}

	return (
		<Card
			onContextMenu={(e) => {
				if (!selected)
					setSelection([mail.id])
				openContextMenu({
					id: 5,
					cursors: {
						x: e.clientX,
						y: e.clientY
					},
					item: mail
				})
			}}
			className={classes.card}
		>
			<Hidden xsDown>
				<div className={classes.root}>
					<div className={classes.startAction}>
						<Checkbox
							checked={selected}
							onChange={() => toggleSelection(mail.id)}
							color='primary'
						/>
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
							size={24}
						/>
					</div>
					<div
						className={classes.content}
						onDoubleClick={onDoubleClick}
					>
						<Typography className={classes.from} variant='body1'>
							{mail.from?.name}
						</Typography>
						<div className={classes.textWrapper}>
							<Typography
								noWrap
								variant='body1'
								component='span'
								display='block'
								className={classes.subject}
							>
								{mail.subject || '(no subject)'}
							</Typography>
							{mail.previewText?.length > 0
							&& <Typography
								noWrap
								variant='body2'
								color='textSecondary'
								component='span'
								display='block'
								className={classes.text}
							>
								{`- ${mail.previewText}`}
							</Typography>
							}
						</div>
					</div>
					<div className={classes.action}>
						<Typography
							variant='body2'
							color='textSecondary'
							component='span'
							className={classes.date}
						>
							{ dayjs(Number(mail.date)).format('MMM DD YYYY[,] HH:mm') }
						</Typography>
						<IconButton
							buttonRef={moreVertButtonRef}
							onClick={(e) => {
								if (!selected)
									setSelection([mail.id])
								openContextMenu({
									id: 5,
									anchor: moreVertButtonRef.current,
									item: mail
								})
							}}
							icon={MoreVert}
							size={38}
						/>
					</div>
				</div>
			</Hidden>
			<Hidden smUp>
				<CardHeader
					onTouchStart={(e) => {
						const [touch] = e.touches
						touchedElement = document.elementFromPoint(touch.pageX, touch.pageY)

						holdTimeout = setTimeout(() => {
							clickInvincibility = true
							toggleSelection(mail.id)
							setTimeout(() => {
								clickInvincibility = false
							}, 500)
						}, 500)
					}}
					onTouchMove={(e) => {
						const [touch] = e.touches
						if (touchedElement !== document.elementFromPoint(touch.pageX, touch.pageY))
							clearTimeout(holdTimeout)
					}}
					onTouchEnd={() => {
						clearTimeout(holdTimeout)
					}}
					avatar={
						<Avatar
							onClick={() => {
								toggleSelection(mail.id)
							}}
							className={classes.mobileAvatar}
						>
							{ selected
								? <Check />
								: <Person />
							}
						</Avatar>
					}
					classes={{ title: classes.mobileTitle, subheader: classes.mobileSubject }}
					title={mail.from?.name}
					titleTypographyProps={{ onClick: onDoubleClick, noWrap: true }}
					subheader={mail.subject}
					subheaderTypographyProps={{ onClick: onDoubleClick, noWrap: true }}
					action={
						<div className={classes.mobileAction}>
							<Typography
								variant='body2'
								color='textSecondary'
								component='span'
								className={classes.date}
							>
								{ dayjs(Number(mail.date)).format('MMM DD YYYY[,] HH:mm') }
							</Typography>
							<IconButton
								onClick={() => {
									setFavorite({
										ids: [mail.id],
										favorite: !mail.favorite
									})
								}}
								icon={ mail.favorite ? Star : StarOutline }
								tooltip={ mail.favorite ? 'Remove from Favorites' : 'Add to Favorites' }
								size={24}
							/>
						</div>
					}
				/>
			</Hidden>
		</Card>
	)
}

const mapState = (state) => ({
	selection: state.selection.mail
})
const mapDispatch = (dispatch) => ({
	setRead: dispatch.mail.setRead,
	setFavorite: dispatch.mail.setFavorite,
	toggleSelection: dispatch.selection.toggleMailSelection,
	setSelection: dispatch.selection.setMailSelection,
	openContextMenu: dispatch.contextMenu.open
})
export default connect(mapState, mapDispatch)(MailPreview)