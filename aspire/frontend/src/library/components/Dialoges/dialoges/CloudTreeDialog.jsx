import { Button, DialogActions, makeStyles, Typography } from '@material-ui/core'
import { TreeItem, TreeView } from '@material-ui/lab'
import { ChevronRight, ExpandMore } from '@material-ui/icons'
import { Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import Dialog from 'library/components/Dialog'

const useStyles = makeStyles((theme) => ({
	dialogContent: {
		userSelect: 'none',
		flexdirection: 'column',
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
		display: 'flex',
		height: '100%',
		width: '100%'
	},
	typography: {
		justifySelf: 'center',
		alignSelf: 'center',
		color: 'red'
	}
}))

function mapTree(cloud, parentId = null) {
	const result = []
	const parentFiles = Object.values(cloud).filter((e) => (e.parent_id === parentId))
	parentFiles.forEach((file) => {
		if (file.type === 'file' || file.trash) return
		result.push({
			id: file.id,
			name: file.name,
			children: mapTree(cloud, file.id)
		})
	})
	if (parentId === null) {
		return {
			id: 'null',
			name: 'Cloud',
			children: result
		}
	} else {
		return result
	}
}

function CloudTreeDialog({ id, dialog, selection, cloud, closeDialog, setParentId, copyFiles }) {
	const classes = useStyles()
	const { open, payload: file } = dialog
	const ids = selection.length > 0 ? selection : [file?.id]
	const tree = mapTree(cloud)

	let currentParentId = location.pathname.replace('/cloud/trash', '').replace('/cloud', '')
	if (currentParentId.startsWith('/'))
		currentParentId = currentParentId.substring(1)
	if (currentParentId.length === 0)
		currentParentId = null

	const initialValues = {
		seleted: ''
	}

	const validateForm = (values) => {
		const errors = {}
		if (!values.selected) errors.selected = true
		return errors
	}

	const onSubmit = (values) => {
		const parent_id = values.selected === 'null' ? null : values.selected
		closeDialog()
		if (file?.submitAction === 1) {
			setParentId({
				ids,
				parent_id,
				currentParentId
			})
		} else if (file?.submitAction === 2) {
			copyFiles({
				ids,
				parent_id
			})
		}
	}

	const renderTree = (nodes, submitForm) => (
		<TreeItem onDoubleClick={submitForm} key={nodes.id} nodeId={nodes.id} label={nodes.name}>
			{Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
		</TreeItem>
	)

	return (
		<Dialog
			open={open === id}
			title={`${file?.treeDialogTitlePrefix} ${ids.length > 1 ? `${ids.length} Files` : 'File'}`}
			contentClass={classes.dialogContent}
			onClose={closeDialog}
		>
			<Formik initialValues={initialValues} validate={validateForm} onSubmit={onSubmit}>
				{({ errors, values, setValues, submitForm, isSubmitting }) => (
					<Form className={classes.form} autoComplete='off'>
						<TreeView
							className={classes.treeView}
							selected={values.selected}
							onNodeSelect={(e, nodeIds) => setValues({ selected: nodeIds })}
							defaultCollapseIcon={<ExpandMore />}
							defaultExpanded={['Cloud']}
							defaultExpandIcon={<ChevronRight />}
						>
							{ renderTree(tree, submitForm) }
						</TreeView>
						{ errors.selected && <Typography variant='body1' className={classes.typography}>Select a Folder</Typography> }
						<DialogProgress visible={isSubmitting} />
						<DialogActions>
							<Button variant='text' disabled={isSubmitting} onClick={closeDialog} color='primary'>Cancel</Button>
							<Button variant='contained' type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Confirm</Button>
						</DialogActions>
					</Form>
				)}
			</Formik>
		</Dialog>
	)
}

const mapState = (state) => ({
	dialog: state.dialog,
	cloud: state.cloud,
	selection: state.selection.cloud
})
const mapDispatch = (dispatch) => ({
	closeDialog: dispatch.dialog.close,
	renameFile: dispatch.cloud.renameFile,
	setParentId: dispatch.cloud.setParentId,
	copyFiles: dispatch.cloud.copyFiles
})
export default connect(mapState, mapDispatch)(CloudTreeDialog)