import { Button, Dialog, DialogActions, DialogContent, LinearProgress, withStyles } from '@material-ui/core'
import { reloadCloudTree } from '../../redux'
import { Field, Form, Formik } from 'formik'
import React, { Component } from 'react'
import { withSnackbar } from 'notistack'
import { connect } from 'react-redux'
import TextField from '../TextField'
import Api from '../../Api'

class CloudRenameDialog extends Component {
	render() {
		const { validateForm, onSubmit, handleClose } = this
		const { classes, open } = this.props

		return (
			<Dialog open={open} onClose={handleClose}>
			<DialogContent className={classes.dialogeContent}>
				<Formik initialValues={{ name: '' }} validate={validateForm} onSubmit={onSubmit}>
				{({ submitForm, isSubmitting }) => (
					<Form autoComplete='off'>
						<Field
							autoFocus
							component={TextField}
							variant='outlined'
							margin='normal'
							fullWidth
							name='name'
							label={'Folder Name'}
						/>
						{isSubmitting && <LinearProgress /> }
						<DialogActions>
							<Button onClick={handleClose} color='primary'>Cancel</Button>
							<Button type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Create</Button>
						</DialogActions>
					</Form>	)}
				</Formik>
			</DialogContent>
			</Dialog>
		)
    }
    
    validateForm = values => {
		const errors = {}
		if(values.name.length < 3) errors.name = 'Name too short'
		if(values.name.length > 128) errors.name = 'Name too long'
		if(values.name.includes('.')) errors.name = 'Folder must not contain a dot'
        return errors
    }

	onSubmit = (values, { setSubmitting }) => {
		const { data, enqueueSnackbar, reloadCloudTree } = this.props
		const { update, location } = data
		setTimeout(() => {
			let path = decodeURIComponent(document.location.pathname).replace(`/cloud/${location === 'user' ? 'u' : location}`, '')
			if(!path.startsWith('/')) path = `/${path}`
			if(path !== '/' && path.endsWith('/')) path = path.slice(0, -1)
			Api.cloud.create({ path: `${path}/${values.name}`, location }).then(res => {
				this.handleClose()
				enqueueSnackbar(res, { variant: 'success' })
				update()
				reloadCloudTree()
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
	}
})

const mapStateToProps = state => { return {} }
const mapDispatchToProps = dispatch => { return { reloadCloudTree: value => dispatch(reloadCloudTree(value)) } }
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withSnackbar(CloudRenameDialog)))