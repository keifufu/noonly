import { makeStyles, Select as MUISelect } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
	select: {
		height: 500
	}
}))

function Select({ children, ...props }) {
	const classes = useStyles()

	return (
		<MUISelect
			MenuProps={{
				anchorOrigin: {
					vertical: 'bottom',
					horizontal: 'left'
				},
				transformOrigin: {
					vertical: 'top',
					horizontal: 'left'
				},
				getContentAnchorEl: null,
				className: classes.select
			}}
			{...props}
		>
			{children}
		</MUISelect>
	)
}

export default Select