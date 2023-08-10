import { ArrowDownward, ArrowUpward } from '@material-ui/icons'
import { useHistory, useLocation } from 'react-router-dom'
import { makeStyles, MenuItem } from '@material-ui/core'
import { connect } from 'react-redux'

import IconButton from 'library/components/IconButton'
import Select from 'library/components/Select'

const useStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: theme.spacing(0.5),
		paddingBottom: theme.spacing(0.5),
		marginRight: theme.spacing(0.5),
		userSelect: 'none',
		display: 'flex',
		justifyContent: 'space-between'
	},
	select: {
		marginTop: -theme.spacing(0.5)
	}
}))

function PasswordToolbar({ sort, setSort }) {
	const classes = useStyles()
	const history = useHistory()
	const location = useLocation()
	const locationString = location.pathname.includes('/passwords/trash') ? 'Trash' : 'Accounts'

	const onChange = (e, x) => {
		if (x.props.value === 'Accounts')
			history.push('/passwords')
		else if (x.props.value === 'Trash')
			history.push('/passwords/trash')
	}

	const onSortChange = (e, x) => {
		setSort({
			by: x.props.value,
			direction: sort.direction
		})
	}

	const onDirectionChange = () => {
		setSort({
			by: sort.by,
			direction: sort.direction === 'Down' ? 'Up' : 'Down'
		})
	}

	return (
		<div className={classes.root}>
			<Select
				onChange={onChange}
				className={classes.select}
				disableUnderline
				value={locationString}
			>
				<MenuItem value='Accounts'>Accounts</MenuItem>
				<MenuItem value='Trash'>Trash</MenuItem>
			</Select>
			<div>
				<Select
					onChange={onSortChange}
					className={classes.select}
					disableUnderline
					value={sort.by}
				>
					<MenuItem value='Name'>Name</MenuItem>
					<MenuItem value='Last Modified'>Last Modified</MenuItem>
				</Select>
				<IconButton
					icon={
						sort.direction === 'Down'
							? ArrowDownward
							: ArrowUpward
					}
					size={24}
					onClick={onDirectionChange}
					tooltip='Reverse sort direction'
				/>
			</div>
		</div>
	)
}

const mapState = (state) => ({
	sort: state.sort.passwords
})
const mapDispatch = (dispatch) => ({
	setSort: dispatch.sort.setPasswords
})
export default connect(mapState, mapDispatch)(PasswordToolbar)