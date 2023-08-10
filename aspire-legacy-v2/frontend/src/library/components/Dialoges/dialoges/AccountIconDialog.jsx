import { Avatar, Button, DialogActions, makeStyles } from '@material-ui/core'
import { connect } from 'react-redux'
import { useContext } from 'react'
import { Formik } from 'formik'

import DialogProgress from 'library/components/DialogProgress'
import UserContext from 'library/contexts/UserContext'
import apiHost from 'library/utilities/apiHost'
import Dialog from 'library/components/Dialog'

const useStyles = makeStyles((theme) => ({
	uploadButton: {
		marginLeft: theme.spacing(2),
		width: 88
	}
}))

function AccountIconDialog({ id, dialog, closeDialog, setIcon, removeIcon }) {
	const { open, payload: password } = dialog
	const classes = useStyles()
	const user = useContext(UserContext)
	const iconURL = `https://${process.env.REACT_APP_HOSTNAME}/ss/${user.username}/icons/${password?.icon}`

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			if (values.icon === null) {
				removeIcon({
					id: password.id,
					onSuccess: () => closeDialog(),
					onFail: () => setSubmitting(false)
				})
			} else {
				setIcon({
					id: password.id,
					icon: values.icon,
					onSuccess: () => closeDialog(),
					onFail: () => setSubmitting(false)
				})
			}
		}, 500)
	}

	return (
		<Dialog
			open={open === id}
			title='Change Icon'
			marginBottom='12px'
			onClose={closeDialog}
		>
			<Formik
				initialValues={{ icon: password?.icon === null ? password?.icon : iconURL }}
				onSubmit={onSubmit}
			>
				{({ submitForm, isSubmitting, values, setValues }) => (<>
					<div style={{ display: 'flex', flexDirection: 'row' }}>
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
							values.icon === null ? (
								<label htmlFor='icon-button' style={{ display: 'flex', flexDirection: 'row' }}>
									<Avatar src={`${apiHost}/accounts/icon?site=${password?.site}`}>
										{password?.site[0].toUpperCase()}
									</Avatar>
									<Button variant='outlined' component='span' className={classes.uploadButton}>
										Upload
									</Button>
								</label>
							) : (<>
								<Avatar src={values.icon}>
									{password?.site[0].toUpperCase()}
								</Avatar>
								<Button
									onClick={() => setValues({ icon: null })}
									variant='outlined'
									component='span'
									className={classes.uploadButton}
								>
									Reset
								</Button>
							</>)
						}
					</div>
					<DialogProgress visible={isSubmitting} />
					<DialogActions>
						<Button variant='text' disabled={isSubmitting} onClick={closeDialog} color='primary'>Cancel</Button>
						<Button variant='contained' type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Confirm</Button>
					</DialogActions>
				</>)}
			</Formik>
		</Dialog>
	)
}

const mapState = (state) => ({
	dialog: state.dialog
})
const mapDispatch = (dispatch) => ({
	closeDialog: dispatch.dialog.close,
	setIcon: dispatch.accounts.setIcon,
	removeIcon: dispatch.accounts.removeIcon
})
export default connect(mapState, mapDispatch)(AccountIconDialog)