import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, withStyles } from '@material-ui/core'
import React, { Component } from 'react'
import { withSnackbar } from 'notistack'
import { Formik } from 'formik'
import Api from '../../Api'

class CloudDeleteDialog extends Component {
	render() {
		const { onSubmit, handleClose } = this
		const { classes, open } = this.props

		return (
			<Dialog open={open} onClose={handleClose}>
                <DialogTitle>Are you sure?</DialogTitle>
				<Formik initialValues={{}} onSubmit={onSubmit}>
					{({ submitForm, isSubmitting }) => (<>
						<DialogContent>
							<DialogContentText>
								You won't be able to recover deleted Items
							</DialogContentText>
						</DialogContent>
						{isSubmitting && <LinearProgress className={classes.progress} /> }
						<DialogActions>
							<Button onClick={handleClose} color='primary'>Cancel</Button>
							<Button type='submit' onClick={submitForm} color='primary'>Confirm</Button>
						</DialogActions>
					</>)}
				</Formik>
            </Dialog>
		)
	}

	onSubmit = (values, { setSubmitting }) => {
		const { enqueueSnackbar, data } = this.props
		setTimeout(() => {
			const { update, selected, location, item, all } = data
			let arg = { ...item, location }
			if(!all && selected.length > 0 && !all) arg = selected.map(item => { return { ...item, location } })
			Api.cloud[all ? 'clearTrash' : `delete${selected.length > 0 ? 'Multiple' : ''}`](arg).then(res => {
				this.handleClose()
				enqueueSnackbar(res, { variant: 'success' })
				update()
			}).catch(err => {
				setSubmitting(false)
				enqueueSnackbar(err, { variant: 'error' })
			})
		}, 250)
	}

	handleClose = () => this.props.onClose()
}

const styles = theme => ({
	progress: {
		marginTop: -theme.spacing(1),
		alignSelf: 'center',
		width: '90%'
	}
})

export default withStyles(styles, { withTheme: true })(withSnackbar(CloudDeleteDialog))