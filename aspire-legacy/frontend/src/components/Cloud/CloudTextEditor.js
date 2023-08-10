import { Button, Dialog, DialogActions, DialogContent, LinearProgress, Typography, withStyles, withWidth } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import TextField from '../TextField'
import Api from '../../Api'

class CloudTextEditor extends Component {
	render() {
		const { classes, width, open, data } = this.props
		const { onSubmit, handleClose } = this
		const mobile = width === 'xs'

		return (
			<Dialog fullScreen={mobile} open={open} onClose={handleClose}>
			<DialogContent className={classes.dialogeContent}>
				<Typography component='h1' variant='h5'>{data?.name}</Typography>
				<Formik initialValues={data} onSubmit={onSubmit}>
					{({ submitForm, isSubmitting }) => (
					<Form autoComplete='off'>
						<Field
							multiline
							component={TextField}
							variant='outlined'
							margin='normal'
							fullWidth
							name='text'
							label='Text'
							rows={mobile ? 30 : 24}
							className={classes.field}
						/>
						{isSubmitting && <LinearProgress /> }
						<DialogActions>
							<Button onClick={handleClose} color='primary'>Cancel</Button>
							<Button type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Save</Button>
						</DialogActions>
					</Form>	)}
				</Formik>
			</DialogContent>
			</Dialog>
		)
	}

	onSubmit = (values, { setSubmitting }) => {
		const { enqueueSnackbar } = this.props
		setTimeout(() => {
			Api.cloud.saveTextFile(values).then(res => {
				setSubmitting(false)
				enqueueSnackbar(res, { variant: 'success' })
			}).catch(err => {
				setSubmitting(false)
				enqueueSnackbar(err, { variant: 'error' })
			})
		}, 500)
	}

	handleClose = () => this.props.onClose()
}

const styles = theme => ({
	dialogeContent: {
		padding: theme.spacing(2),
		flexDirection: 'column',
		alignItems: 'center',
		display: 'flex'
	},
	field: {
		width: 500,
		[theme.breakpoints.down('xs')]: {
			width: 350
		}
	}
})

export default withStyles(styles, { withTheme: true })(withSnackbar(withWidth()(CloudTextEditor)))