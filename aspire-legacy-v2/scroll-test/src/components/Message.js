import { Card, CardHeader, Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
	card: {
		height: props => props.height,
		// backgroundColor: props => props.backgroundColor,
		backgroundColor: props => props.author === 'keifufu' ? '#ad3bd6' : '#3ed63b',
		marginTop: theme.spacing(1)
	}
}))

function Message({ author, height, backgroundColor, content, id }) {
	const classes = useStyles({ height, backgroundColor, author })
	return (
		<Card id={id} className={classes.card}>
			<CardHeader
				avatar={<Avatar />}
				title={author}
				subheader={content}
			/>
		</Card>
	)
}

export default Message