import { Avatar, Button, Dialog, DialogActions, DialogContent, LinearProgress, withStyles } from '@material-ui/core'
import React, { Component } from 'react'
import { withSnackbar } from 'notistack'
import { Formik } from 'formik'
import Api from '../../Api'

class PasswordIconDialoge extends Component {
	render() {
		const { classes, open, item } = this.props
		const { account_username, icon } = item
		const { onSubmit, handleClose } = this
		const iconURL = `https://aspire.icu/ss/${account_username}/icons/${icon}`

		return (
			<Dialog open={open} onClose={handleClose}>
                <Formik initialValues={{ icon: icon === 'null' ? icon : iconURL }} onSubmit={onSubmit}>
                    {({ submitForm, isSubmitting, values, setValues }) => (<>
                        <DialogContent style={{ display: 'flex', flexDirection: 'row' }}>
							<input
								style={{ display: 'none' }}
								onChange={({ target }) => {
									const fileReader = new FileReader()
									fileReader.readAsDataURL(target.files[0])
									fileReader.onload = (e) => setValues({ icon: e.target.result })
								}}
								id='icon-button'
								accept='image/*'
								type='file'
							/>
							{
								values.icon === 'null' ? (
									<label htmlFor='icon-button' style={{ display: 'flex', flexDirection: 'row' }}>
										<Avatar src={`https://i.olsh.me/icon?url=${item.site}&size=32..192..256`}>
											{item.site?.[0].toUpperCase()}
										</Avatar>
										<Button variant='outlined' component='span' className={classes.uploadButton}>
											Upload
										</Button>
									</label>
								) : (<>
									<Avatar src={values.icon}>
										{item.site?.[0].toUpperCase()}
									</Avatar>
									<Button onClick={() => setValues({ icon: 'null' })} variant='outlined' component='span' className={classes.uploadButton}>
										Reset
									</Button>
								</>)
							}
                        </DialogContent>
						{isSubmitting && <LinearProgress className={classes.progress} /> }
                        <DialogActions>
                            <Button onClick={handleClose} color='primary'>Cancel</Button>
                            <Button type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Confirm</Button>
                        </DialogActions>
                    </>)}
                </Formik>
            </Dialog>
		)
	}

	onSubmit = (values, { setSubmitting }) => {
		const { update, enqueueSnackbar } = this.props
		setTimeout(() => {
			let arg1 = 'setIcon'
			if(values.icon === 'null') arg1 = 'removeIcon'
			Api.passwords[arg1](this.props.item, values.icon).then(res => {
				this.handleClose()
				enqueueSnackbar(res, { variant: 'success' })
				update()
			}).catch(err => {
				setSubmitting(false)
				enqueueSnackbar(err, { variant: 'error' })
			})
		}, 500)
	}

    handleClose = () => this.props.onClose()
}

const styles = theme => ({
	uploadButton: {
		marginLeft: theme.spacing(2)
	},
	progress: {
		alignSelf: 'center',
		width: '70%'
	}
})

export default withStyles(styles, { withTheme: true })(withSnackbar(PasswordIconDialoge))