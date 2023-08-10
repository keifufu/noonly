import { Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Typography, withStyles } from '@material-ui/core'
import { ChevronRight, ExpandMore } from '@material-ui/icons'
import { TreeView, TreeItem } from '@material-ui/lab'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import { Form, Formik } from 'formik'
import { connect } from 'react-redux'
import Api from '../../Api'

class CloudTreeDialog extends Component {
	constructor(props) {
		super(props)
		this.state = {
			data: {},
			selected: ''
		}
	}
	
	render() {
		const { validateForm, onSubmit, handleClose } = this
		const { classes, open } = this.props
		const { data } = this.state
		if(!data.user || !data.shared) return <div />

		const tree = {
			id: 'Cloud',
			name: 'Cloud',
			children: [
				{
					id: `cloud/user/${JSON.parse(localStorage.getItem('user')).username}`,
					name: 'User',
					children: data.user.children
				},
				{
					id: 'cloud/shared',
					name: 'Shared',
					children: data.shared.children
				}
			]
		}

		const renderTree = (nodes, submitForm) => (
			<TreeItem onDoubleClick={submitForm} key={nodes.id} nodeId={nodes.id} label={nodes.name}>
				{Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
			</TreeItem>
		)

		return (
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>Select a Folder</DialogTitle>
				<Formik initialValues={{ selected: '' }} validate={validateForm} onSubmit={onSubmit}>
					{({ errors, values, setValues, submitForm, isSubmitting }) => (
					<Form className={classes.form} autoComplete='off'>
						<DialogContent className={classes.dialogeContent}>
							<TreeView className={classes.treeView} selected={values.selected} onNodeSelect={(e, nodeIds) => setValues({ selected: nodeIds })} defaultCollapseIcon={<ExpandMore />} defaultExpanded={['Cloud']} defaultExpandIcon={<ChevronRight />} >
								{renderTree(tree, submitForm)}
							</TreeView>
						</DialogContent>
						{ errors.selected && <Typography variant='body1' className={classes.typography}>Select a Folder</Typography> }
						{isSubmitting && <LinearProgress className={classes.progress} /> }
						<DialogActions>
							<Button onClick={handleClose} color='primary'>Cancel</Button>
							<Button type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Confirm</Button>
						</DialogActions>
					</Form>	)}
				</Formik>
			</Dialog>
		)
	}

	componentDidMount = () => this.fetchTree()
	componentDidUpdate = prevProps => {
		if(prevProps.reloadCloudTree !== this.props.reloadCloudTree) this.fetchTree()
	}

	fetchTree = () => {
		const { enqueueSnackbar } = this.props
		Api.cloud.tree().then(res => {
			this.setState({ data: res })
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
		})
	}
    
    validateForm = values => {
		const errors = {}
		if(!values.selected) errors.selected = true
		if(values.selected === 'Cloud') errors.selected = true
        return errors
    }

	onSubmit = values => {
		this.props.data.moveItem(values.selected)
		this.handleClose()
	}

	handleClose = () => this.props.onClose()
}

const styles = theme => ({
	dialogeContent: {
		userSelect: 'none',
		padding: theme.spacing(2),
		flexDirection: 'column',
		display: 'flex',
		height: 400,
		width: 350
	},
	treeView: {
		backgroundColor: theme.palette.background.default,
		borderRadius: theme.shape.borderRadius,
		padding: theme.spacing(2),
		overflow: 'scroll',
		maxWidth: 400,
		flexGrow: 1,
		height: 110
	},
	form: {
		flexDirection: 'column',
		display: 'flex'
	},
	typography: {
		justifySelf: 'center',
		alignSelf: 'center',
		color: 'red'
	},
	progress: {
		borderRadius: theme.shape.borderRadius,
		justifySelf: 'center',
		alignSelf: 'center',
		width: '90%'
	}
})

const mapStateToProps = state => { return { reloadCloudTree: state.reloadCloudTree } }
const mapDispatchToProps = dispatch => { return {} }
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withSnackbar(CloudTreeDialog)))