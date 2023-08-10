import { Block, Cancel, ChatBubble, Check, MoreVert } from '@material-ui/icons'
import { Avatar, Card, CardHeader, fade, makeStyles } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { useRef } from 'react'

import IconButton from 'library/components/IconButton'

const useStyles = makeStyles((theme) => ({
	card: {
		'&:hover': {
			backgroundColor: fade(theme.palette.common.black, 0.1)
		}
	},
	header: {
		padding: theme.spacing(1)
	},
	avatar: {
		width: 38,
		height: 38
	},
	action: {
		display: 'flex',
		alignSelf: 'center',
		marginTop: 0,
		marginRight: theme.spacing(0.3)
	}
}))

function Friend({ friend }) {
	const classes = useStyles()
	const dispatch = useDispatch()
	const moreVertButtonRef = useRef()

	const onContextMenu = (e) => {
		dispatch.contextMenu.open({
			id: 8,
			cursors: {
				x: e.clientX,
				y: e.clientY
			},
			item: friend
		})
	}

	const onContextMenuClick = (e) => {
		dispatch.contextMenu.open({
			id: 8,
			anchor: moreVertButtonRef.current,
			item: friend
		})
	}

	return (
		<Card
			onContextMenu={onContextMenu}
			className={classes.card}
		>
			<CardHeader
				classes={{ action: classes.action }}
				className={classes.header}
				avatar={ <Avatar src={friend.avatar} className={classes.avatar} /> }
				title={friend.username}
				subheader={friend.status}
				action={
					friend.requestType
						? friend.requestType === 'incoming'
							? (<>
								<IconButton
									tooltip='Accept Friend Request'
									tooltipLocation='top'
									icon={Check}
									onClick={() => {
										dispatch.friends.addFriend({ username: friend.username })
									}}
									size={38}
								/>
								<IconButton
									tooltip='Deny Friend Request'
									tooltipLocation='top'
									icon={Block}
									onClick={() => {
										dispatch.friends.removeFriend({ user_id: friend.id })
									}}
									size={38}
								/>
							</>)
							: <IconButton
								tooltip='Cancel Friend Request'
								tooltipLocation='top'
								icon={Cancel}
								onClick={() => {
									dispatch.friends.removeFriend({ user_id: friend.id })
								}}
								size={38}
							/>
						: (<>
							<IconButton
								tooltip={`Message ${friend.username}`}
								tooltipLocation='top'
								icon={ChatBubble}
								onClick={() => null}
								size={38}
							/>
							<IconButton
								icon={MoreVert}
								buttonRef={moreVertButtonRef}
								onClick={onContextMenuClick}
								size={38}
							/>
						</>)
				}
			/>
		</Card>
	)
}

export default Friend