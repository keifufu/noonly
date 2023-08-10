import { Box, Link, Typography, withStyles } from '@material-ui/core'
import React, { Component } from 'react'

class Copyright extends Component {
	render() {
		const { classes } = this.props
		return (
			<Box mt={2} className={classes.box}>
				<Typography variant='body2' color='textSecondary' align='center'>
					{'Copyright © '}
					<Link color='inherit' href=''>
						Aspire.icu
					</Link>{' '}
					{new Date().getFullYear()}
					{'.'}
				</Typography>
			</Box>
		)
	}
}

const styles = theme => ({
	box: {
		marginBottom: theme.spacing(1)
	}
})

export default withStyles(styles, { withTheme: true })(Copyright)