import { Add, Clear, DragHandle, Visibility, VisibilityOff } from '@material-ui/icons'
import { Button, DialogActions, fade, makeStyles, useMediaQuery } from '@material-ui/core'
import { connect, useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@material-ui/styles'
import { useState, useContext } from 'react'
import { Form, Formik } from 'formik'
import DnDList from 'react-dnd-list'

import IconButton from 'library/components/IconButton/IconButton'
import DialogProgress from 'library/components/DialogProgress'
import UserContext from 'library/contexts/UserContext'
import Dialog from 'library/components/Dialog'
import clsx from 'clsx'

const useStyles = makeStyles((theme) => ({
	action: {
		marginTop: -4,
		marginBottom: -8
	},
	root: {
		height: 50,
		borderRadius: 4,
		backgroundColor: theme.palette.background.paper,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: theme.spacing(1),
		userSelect: 'none',
		marginBottom: (props) => !props.last && 8
	},
	highlight: {
		animation: '$highlight 3s infinite'
	},
	'@keyframes highlight': {
		'0%': { backgroundColor: theme.palette.background.paper },
		'50%': { backgroundColor: fade(theme.palette.primary.main, 0.5) },
		'100%': { backgroundColor: theme.palette.background.paper }
	},
	container: {
		display: 'flex',
		alignItems: 'center'
	},
	handle: {
		marginRight: theme.spacing(1),
		cursor: 'pointer',
		'&:active': {
			cursor: 'grabbing'
		}
	}
}))

const _visible = {}
const Item = (props) => {
	const { dnd, highlight: _highlight } = props
	const classes = useStyles({ last: props.last })
	const dispatch = useDispatch()
	const user = useContext(UserContext)
	const isMainAddress = props.item === `${user.username.toLowerCase()}@${process.env.REACT_APP_HOSTNAME}`
	const mailVisible = useSelector((state) => state.mail.visible)
	const origName = useSelector((state) => state.mail.origName)
	const [highlight, setHighlight] = useState(_highlight)
	const [visible, setVisible] = useState(mailVisible[props.item])
	_visible[props.item] = visible

	const rootClass = clsx(classes.root, { [classes.highlight]: highlight })

	return (
		<div
			style={{
				...dnd.item.styles
			}}
			className={dnd.item.classes}
			ref={dnd.item.ref}
		>
			<div className={rootClass}>
				<div className={classes.container}>
					<DragHandle className={classes.handle} style={{ ...dnd.handler.styles }} {...dnd.handler.listeners} />
					{origName[props.item]}
				</div>
				<div className={classes.container}>
					{
						isMainAddress
							? <Visibility color='disabled' style={{ margin: '0px 9px' }} />
							: <IconButton
								tooltip={`${visible ? 'Hide' : 'Show'} Address`}
								icon={visible ? Visibility : VisibilityOff}
								size={42}
								onClick={() => {
									setVisible(!visible)
									if (highlight)
										setHighlight(false)
								}}
							/>
					}
					{
						isMainAddress
							? <Clear color='disabled' style={{ margin: '0px 9px' }} />
							: <IconButton
								tooltip='Delete Address'
								icon={Clear}
								size={42}
								onClick={() => dispatch.dialog.open({ id: 19, payload: props.item })}
							/>
					}
				</div>
			</div>
		</div>
	)
}

let order = []
const List = ({ addresses, highlight }) => {
	const [list, setList] = useState(addresses)
	order = list
	const theme = useTheme()
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))

	return (
		<ul
			style={{
				backgroundColor: theme.palette.background.default,
				borderRadius: 4,
				padding: theme.spacing(2),
				overflow: 'scroll',
				height: '400px',
				width: !isMobile && '500px'
			}}
		>
			<DnDList
				items={list}
				itemComponent={(props) => <Item highlight={highlight?.includes(props.item)} {...props} />}
				setList={setList}
			/>
		</ul>
	)
}

function MailManageDialog({ id, dialog, closeDialog, openDialog, setOrderAndVisibility }) {
	const { open, payload: highlight } = dialog
	const mail = useSelector((state) => state.mail)
	const addresses = Object.keys(mail).filter((e) => e.includes(`@${process.env.REACT_APP_HOSTNAME}`)).sort((a, b) => mail.order[a] - mail.order[b])

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			setOrderAndVisibility({
				order,
				visible: _visible,
				onSuccess: () => closeDialog(),
				onFail: () => setSubmitting(false)
			})
		}, 500)
	}

	return (
		<Dialog
			open={open === id}
			title='Manage Addresses'
			marginBottom='12px'
			onClose={closeDialog}
		>
			<Formik
				initialValues={{}}
				onSubmit={onSubmit}
			>
				{({ submitForm, isSubmitting }) => (
					<Form autoComplete='off'>
						<List addresses={addresses} highlight={highlight} />
						<DialogProgress visible={isSubmitting} />
						<DialogActions style={{ display: 'flex', justifyContent: 'space-between' }}>
							<Button variant='contained' disabled={isSubmitting} onClick={() => openDialog({ id: 20 })} color='primary'>
								<Add style={{ marginRight: 8, marginLeft: -8 }} /> Add Address
							</Button>
							<div>
								<Button variant='text' disabled={isSubmitting}
									onClick={closeDialog} color='primary' style={{ marginRight: 8 }}>Cancel</Button>
								<Button variant='contained' type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Update</Button>
							</div>
						</DialogActions>
					</Form>
				)}
			</Formik>
		</Dialog>
	)
}

const mapState = (state) => ({
	dialog: state.dialog
})
const mapDispatch = (dispatch) => ({
	closeDialog: dispatch.dialog.close,
	openDialog: dispatch.dialog.open,
	setOrderAndVisibility: dispatch.mail.setOrderAndVisibility
})
export default connect(mapState, mapDispatch)(MailManageDialog)