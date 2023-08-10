import { Breadcrumbs, Hidden, Link, makeStyles, MenuItem, Select, Typography } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { useDrop } from 'react-dnd'
import React from 'react'

const useStyles = makeStyles(theme => ({
	root: {
		paddingLeft: theme.spacing(0.5),
		userSelect: 'none'
	},
	select: {
		marginTop: -theme.spacing(0.5)
	}
}))

function CloudBreadcrumbs(props) {
	const pathnames = decodeURIComponent(document.location.pathname).split('/').filter(e => e).slice(2)
	const { update } = props.data
	const history = useHistory()
	const classes = useStyles()
	const name = props.data.location === 'user' ? 'Cloud' : props.data.location === 'trash' ? 'Trash' : 'Shared'
	const onChange = (e, x) => {
		history.push(`/cloud/${x.props.value === 'Cloud' ? 'u' : x.props.value === 'Trash' ? 'trash' : 'shared'}`)
		update()
	}

	return (
		<div className={classes.root}>
			<Breadcrumbs>
				{pathnames.length > 0 ? 
				<DroppableLink name={name} routeTo={`/cloud/${props.data.location === 'user' ? 'u' : props.data.location}`} {...props}/>
				: <div>
					<Hidden xsDown>
						<Select onChange={onChange} className={classes.select} disableUnderline value={name}>
							<MenuItem value='Cloud'>Cloud</MenuItem>
							<MenuItem value='Trash'>Trash</MenuItem>
							<MenuItem value='Shared'>Shared</MenuItem>
						</Select>
					</Hidden>
					<Hidden smUp>
						<Typography>{name}</Typography>
					</Hidden>
				</div>}
				{pathnames.map((name, i) => {
					const routeTo = `/cloud/${props.data.location === 'user' ? 'u' : props.data.location}/${pathnames.slice(0, i + 1).join('/')}`
					const isLast = i === pathnames.length - 1
					return isLast ? <Typography key={i}>{name}</Typography> : <DroppableLink name={name} routeTo={routeTo} key={i} {...props}/>
				})}
			</Breadcrumbs>
		</div>
	)
}

function DroppableLink(props) {
	const { name, routeTo, data } = props
	const { update, location, selected, moveCopyItem } = data
	const history = useHistory()

	const [{ isOver }, drop] = useDrop({
		accept: ['file', 'folder'],
		drop: droppedItem => {
			let path = routeTo.replace(`/cloud/${location === 'user' ? 'u' : location}`, '')
			if(!path.startsWith('/')) path = `/${path}`
			if(path !== '/' && path.endsWith('/')) path = path.slice(0, -1)
			const item = { path: droppedItem.path, newPath: `${path}/${droppedItem.name}`, location: location, newLocation: location }
			const undoItem = { path: item.newPath, newPath: item.path, location: item.newLocation, newLocation: item.location }
			const itemArray = selected.map(item => { return { path: item.path, newPath: `${path}/${item.name}`, location: location, newLocation: location } })
			const undoArray = itemArray.map(item => { return { path: item.newPath, newPath: item.path, location: item.newLocation, newLocation: item.location } })
			moveCopyItem('rename', item, undoItem, itemArray, undoArray, selected)
		},
		canDrop: item => {
			if(item?.name === name) return false
			else return true
		},
		collect: monitor => ({
			isOver: monitor.isOver()
		})
	})

	const onClick = () => {
		history.push(routeTo)
		update()
	}

	return <Link ref={drop} style={{ cursor: 'pointer', color: isOver && 'white' }} color='inherit' onClick={onClick}>{name}</Link>
}

export default CloudBreadcrumbs