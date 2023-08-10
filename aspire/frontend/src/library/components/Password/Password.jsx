import { Avatar, Card, IconButton as MUIIconButton, CardHeader, fade, makeStyles } from '@material-ui/core'
import { useRef, useState, useContext } from 'react'
import { MoreVert } from '@material-ui/icons'
import { useDispatch } from 'react-redux'

import IconButton from 'library/components/IconButton'
import UserContext from 'library/contexts/UserContext'
import devBuild from 'library/utilities/devBuild'

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

function Password({ password }) {
	const { site, username, email, icon } = password
	const dispatch = useDispatch()
	const classes = useStyles()
	const [avatar, setAvatar] = useState(null)
	const user = useContext(UserContext)
	const customIcon = `https://aspire.icu/ss/${user.username}/icons/${icon}`
	const iconUrl = icon === null ? `https://aspire.icu:${devBuild ? '98' : '97'}/passwords/icon?site=${site}` : customIcon
	const moreVertButtonRef = useRef()

	const onContextMenu = (e) => {
		dispatch.contextMenu.open({
			id: 2,
			cursors: {
				x: e.clientX,
				y: e.clientY
			},
			item: password
		})
	}

	const onClick = () => {
		dispatch.contextMenu.open({
			id: 2,
			anchor: moreVertButtonRef.current,
			item: password
		})
	}

	const onIconClick = () => {
		dispatch.dialog.open({
			id: 5,
			payload: password
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

export default Password