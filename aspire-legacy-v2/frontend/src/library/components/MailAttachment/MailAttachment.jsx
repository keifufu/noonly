import { Card, CardHeader, fade, makeStyles, Tooltip, Typography } from '@material-ui/core'
import { GetApp } from '@material-ui/icons'
import { useDispatch } from 'react-redux'

import downloadAttachment from 'library/common/download/downloadAttachment'
import getIcoFromName from 'library/utilities/getIcoFromName'
import IconButton from 'library/components/IconButton'

const useStyles = makeStyles((theme) => ({
	card: {
		backgroundColor: fade(theme.palette.common.white, 0.05),
		width: '100%'
	},
	avatar: {
		pointerEvents: 'none',
		height: 24,
		width: 24,
		display: 'flex',
		alignSelf: 'center'
	},
	title: {
		fontSize: 20,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
		marginRight: -theme.spacing(1)
	},
	action: {
		marginBottom: -theme.spacing(1),
		marginRight: -theme.spacing(1),
		alignSelf: 'center'
	},
	content: {
		overflow: 'hidden'
	}
}))

function MailAttachment({ mailId, attachment }) {
	const classes = useStyles()
	const iconURL = getIcoFromName(attachment.filename)
	const dispatch = useDispatch()

	return (
		<Card className={classes.card}>
			<CardHeader
				classes={{
					content: classes.content,
					action: classes.action
				}}
				avatar={
					<img className={classes.avatar} alt='' src={iconURL} />
				}
				action={
					<IconButton
						onClick={() => {
							downloadAttachment(mailId, attachment.id, attachment.filename).catch((err) => {
								dispatch.notifcations.add({
									text: err.message,
									severity: 'error'
								})
							})
						}}
						icon={GetApp}
						tooltip='Download'
						size={40}
					/>
				}
				title={
					<Tooltip
						title={attachment.filename}
						enterDelay={500}
					>
						<Typography
							className={classes.title}
							variant='body2'
						>
							{attachment.filename}
						</Typography>
					</Tooltip>
				}
			/>
		</Card>
	)
}

export default MailAttachment