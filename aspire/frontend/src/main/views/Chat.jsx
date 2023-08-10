import { makeStyles } from '@material-ui/core'
import { useLocation } from 'react-router'
import { Helmet } from 'react-helmet'

import Friends from 'library/components/Friends'
import Channel from 'library/components/Channel'

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(2),
		height: `calc(100vh - ${theme.mixins.toolbar.minHeight + 10}px)`,
		display: 'flex',
		flexDirection: 'column'
	}
}))

function Chat() {
	const classes = useStyles()
	const location = useLocation()

	let selectedChannelId = location.pathname.replace('/chat', '')
	if (selectedChannelId.startsWith('/'))
		selectedChannelId = selectedChannelId.substring(1)
	if (selectedChannelId.length === 0)
		selectedChannelId = null

	return (<>
		<Helmet>
			<title>Chat - Aspire</title>
		</Helmet>
		<div className={classes.root}>
			{
				selectedChannelId === null
					? <Friends />
					: <Channel id={selectedChannelId} />
			}
		</div>
	</>)
}

export default Chat