import { ArrowDownward, ArrowUpward } from '@material-ui/icons'
import { useHistory, useLocation } from 'react-router-dom'
import { makeStyles, MenuItem } from '@material-ui/core'
import { forceCheck } from 'react-lazyload'
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

function ScreenshotToolbar({ sort, setSort }) {
	const classes = useStyles()
	const history = useHistory()
	const location = useLocation()
	const locationString
	= location.pathname.includes('/screenshots/trash')
		? 'Trash'
		: location.pathname.includes('/screenshots/favorite')
			? 'Favorite'
			: 'Screenshots'

	const onChange = (e, x) => {
		if (x.props.value === 'Screenshots')
			history.push('/screenshots')
		else if (x.props.value === 'Favorite')
			history.push('/screenshots/favorite')
		else if (x.props.value === 'Trash')
			history.push('/screenshots/trash')
	}

	const onSortChange = (e, x) => {
		setSort({
			by: x.props.value,
			direction: sort.direction
		})
		forceCheck()
	}

	const onDirectionChange = () => {
		setSort({
			by: sort.by,
			direction: sort.direction === 'Down' ? 'Up' : 'Down'
		})
		forceCheck()
	}

	return (
		<div className={classes.root}>
			<Select
				onChange={onChange}
				className={classes.select}
				disableUnderline
				value={locationString}
			>
				<MenuItem value='Screenshots'>Screenshots</MenuItem>
				<MenuItem value='Favorite'>Favorite</MenuItem>
				<MenuItem value='Trash'>Trash</MenuItem>
			</Select>
			<div>
				<Select
					onChange={onSortChange}
					className={classes.select}
					disableUnderline
					value={sort.by}
				>
					<MenuItem value='Date'>Date</MenuItem>
					<MenuItem value='Type'>Type</MenuItem>
					<MenuItem value='Filesize'>Filesize</MenuItem>
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
	sort: state.sort.screenshots
})
const mapDispatch = (dispatch) => ({
	setSort: dispatch.sort.setScreenshots
})
export default connect(mapState, mapDispatch)(ScreenshotToolbar)