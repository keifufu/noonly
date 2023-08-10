import { Breadcrumbs, Hidden, makeStyles, MenuItem, Typography } from '@material-ui/core'
import { ArrowDownward, ArrowUpward } from '@material-ui/icons'
import { useHistory, useLocation } from 'react-router-dom'
import { connect } from 'react-redux'

import DroppableLink from 'library/components/DroppableLink'
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

function getBreadcrumbs(cloud, currentParentId, breadcrumbs) {
	const result = breadcrumbs || []
	const parent = cloud[currentParentId]
	if (parent) {
		result.push({
			name: parent.name,
			id: parent.id
		})
		return getBreadcrumbs(cloud, parent?.parent_id, result)
	} else {
		return result
	}
}

function CloudToolbar({ cloud, currentParentId, sort, setSort }) {
	const classes = useStyles()
	const history = useHistory()
	const location = useLocation()
	const breadcrumbs = getBreadcrumbs(cloud, currentParentId).reverse()
	const locationString = location.pathname.includes('/cloud/trash') ? 'Trash' : 'Cloud'

	const onChange = (e, x) => {
		if (x.props.value === 'Cloud')
			history.push('/cloud')
		else if (x.props.value === 'Trash')
			history.push('/cloud/trash')
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
			<Breadcrumbs>
				{breadcrumbs.length > 0
					? <DroppableLink
						name={locationString}
						parent_id={null}
						currentParentId={currentParentId}
						routeTo={'/cloud/'}
					/>
					: <div>
						<Hidden xsDown>
							<Select
								onChange={onChange}
								className={classes.select}
								disableUnderline
								value={locationString}
							>
								<MenuItem value='Cloud'>Cloud</MenuItem>
								<MenuItem value='Trash'>Trash</MenuItem>
							</Select>
						</Hidden>
						<Hidden smUp>
							<Typography>{locationString}</Typography>
						</Hidden>
					</div>
				}
				{
					breadcrumbs.map(({ name, id }, i) => {
						const routeTo = `/cloud/${id}`
						const isLast = i === breadcrumbs.length - 1
						return isLast
							? <Typography key={i}>{name}</Typography>
							: <DroppableLink
								name={name}
								parent_id={id}
								currentParentId={currentParentId}
								routeTo={routeTo}
								key={i}
							/>
					})
				}
			</Breadcrumbs>
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
	sort: state.sort.cloud,
	cloud: state.cloud
})
const mapDispatch = (dispatch) => ({
	setSort: dispatch.sort.setCloud
})
export default connect(mapState, mapDispatch)(CloudToolbar)