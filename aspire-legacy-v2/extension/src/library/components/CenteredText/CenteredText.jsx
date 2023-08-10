import { makeStyles, Typography } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		height: '70vh'
	}
}))

function CenteredText({ text }) {
	const classes = useStyles()
	const splitText = text.split('\\n')

	return (
		<div className={classes.root}>
			{splitText.map((content) => (
				<Typography
					variant='h5'
					key={content}
				>
					{content}
				</Typography>
			))}
		</div>
	)
}

export default CenteredText