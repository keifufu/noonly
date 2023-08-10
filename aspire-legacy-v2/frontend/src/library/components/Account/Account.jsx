import { Avatar, Card, IconButton as MUIIconButton, CardHeader, fade, makeStyles } from '@material-ui/core'
import { MoreVert } from '@material-ui/icons'
import { useDispatch } from 'react-redux'
import { useRef, useState } from 'react'

import IconButton from 'library/components/IconButton'
import apiHost from 'library/utilities/apiHost'

const useStyles = makeStyles((theme) => ({
	card: {
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.1)
		},
		transition: '0.05s all ease-in-out'
	},
	avatarButton: {
		padding: 0
	},
	action: {
		marginTop: -4,
		marginBottom: -8
	}
}))

function Account({ account }) {
	const { site, username, email, icon } = account
	const dispatch = useDispatch()
	const classes = useStyles()
	const [avatar, setAvatar] = useState(null)
	const customIcon = `https://img.${process.env.REACT_APP_HOSTNAME}/icon/${icon}`
	const iconUrl = icon ? customIcon : `${apiHost}/account/icon?site=${site}`
	const moreVertButtonRef = useRef()

	const onContextMenu = (e) => {
		dispatch.contextMenu.open({
			id: 2,
			cursors: {
				x: e.clientX,
				y: e.clientY
			},
			item: account
		})
	}

	const onClick = () => {
		dispatch.contextMenu.open({
			id: 2,
			anchor: moreVertButtonRef.current,
			item: account
		})
	}

	const onIconClick = () => {
		dispatch.dialog.open({
			id: 5,
			payload: account
		})
	}

	const img = new Image()
	img.onload = () => setAvatar(iconUrl)
	img.src = iconUrl

	return (
		<Card
			onContextMenu={onContextMenu}
			className={classes.card}
		>
			<CardHeader
				classes={{ action: classes.action }}
				avatar={
					<MUIIconButton className={classes.avatarButton} onClick={onIconClick} >
						<Avatar src={avatar}>
							{site[0].toUpperCase()}
						</Avatar>
					</MUIIconButton>
				}
				action={
					<IconButton buttonRef={moreVertButtonRef} onClick={onClick} icon={MoreVert} />
				}
				title={site}
				subheader={`${email && username ? `${email} - ${username}` : email ? email : username}`}
			/>
		</Card>
	)
}

export default Account