import { Card, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
	card: {
		padding: theme.spacing(1),
		margin: theme.spacing(0.5, 0, 0.5, 0)
	}
}))

function ChannelMessage(message) {
	const classes = useStyles()

	return (
		<Card className={classes.card}>
			{message.content}
		</Card>
	)
}

export default ChannelMessage