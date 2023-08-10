import { Button, Dialog, DialogActions, DialogContent, LinearProgress, withStyles } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import React, { Component } from 'react'
import TextField from '../TextField'

class CloudRenameDialog extends Component {
	render() {
		const { validateForm, onSubmit, handleClose } = this
		const { classes, open, data } = this.props
		const { item } = data

		return (
			<Dialog open={open} onClose={handleClose}>
			<DialogContent className={classes.dialogeContent}>
				<Formik initialValues={item} validate={validateForm} onSubmit={onSubmit}>
					{({ submitForm, isSubmitting }) => (
					<Form autoComplete='off'>
						<Field
							autoFocus
							component={TextField}
							variant='outlined'
							margin='normal'
							fullWidth
							name='name'
							label={item.type === 'folder' ? 'Folder Name' : 'File Name'}
						/>
						{isSubmitting && <LinearProgress /> }
						<DialogActions>
							<Button onClick={handleClose} color='primary'>Cancel</Button>
							<Button type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Rename</Button>
						</DialogActions>
					</Form>	)}
				</Formik>
			</DialogContent>
			</Dialog>
		)
    }
    
    validateForm = values => {
		const errors = {}
		const isFolder = values.type === 'folder'
		if(values.name.length > 128) errors.name = 'Name too long'
		if(!isFolder && !values.name.includes('.')) errors.name = 'File must have an extension'
		if(!isFolder && values.name.includes('.') && values.name.split('.')[values.name.split('.').length - 1].length === 0) errors.name = 'File must have an extension'
		if(isFolder && values.name.includes('.')) errors.name = 'Folder must not contain a dot'
        return errors
    }

	onSubmit = values => {
		const { item, location, moveCopyItem } = this.props.data
		setTimeout(() => {
			const _item = { path: item.path, newPath: item.path.replace(item.name, values.name), location: location, newLocation: location }
			const undoItem = { path: _item.newPath, newPath: _item.path, location: _item.newLocation, newLocation: _item.location }
			if(_item.path === _item.newPath) return this.handleClose()
			moveCopyItem('rename', _item, undoItem, [], [], [])
			this.handleClose()
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

export default withStyles(styles, { withTheme: true })(CloudRenameDialog)