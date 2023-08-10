import { Hidden, makeStyles, MenuItem, MenuList, Popover, SwipeableDrawer, useMediaQuery } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
	icon: {
		marginLeft: -theme.spacing(1),
		marginRight: theme.spacing(1),
		pointerEvents: 'none'
	},
	paper: {
		backgroundColor: theme.palette.background.paper
	}
}))

function Menu(props) {
	const { items, cursors, onClose, open, anchor,
		anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
		transformOrigin = { vertical: 'top', horizontal: 'right' } } = props
	const classes = useStyles()
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))

	const isItemVisible = (item) => {
		if (typeof item.visible === 'boolean') return item.visible
		if (typeof item.visible === 'function') return item.visible()
		return true
	}

	const isItemHidden = (item) => {
		if (['xsUp', 'xsDown', 'xlUp', 'xsDown', 'smUp', 'smDown', 'mdUp', 'mdDown', 'lgUp', 'lgDown'].includes(item.hidden)) return true
		return false
	}

	const onItemClick = (item) => {
		onClose()
		if (typeof item.onClick === 'function') item.onClick()
	}

	const PopoverProps = cursors ? {
		anchorReference: 'anchorPosition',
		anchorPosition: { top: cursors.y, left: cursors.x },
		anchorOrigin: {
			vertical: 'bottom',
			horizontal: 'left'
		},
		transformOrigin: {
			vertical: 'top',
			horizontal: 'left'
		}
	} : {
		anchorEl: anchor
	}

	const menuList = (
		<MenuList>
			{items.map((item, index) => {
				if (isItemVisible(item) && !isItemHidden(item)) {
					const Icon = item.icon
					return (
						<MenuItem disableRipple onClick={() => onItemClick(item)} key={index}>
							<Icon color='primary' className={classes.icon} />
							{item.name}
						</MenuItem>
					)
				} else if (isItemHidden(item)) {
					const Icon = item.icon
					const props = {}
					props[item.hidden] = true
					return (
						<Hidden {...props} key={index}>
							<MenuItem disableRipple onClick={() => onItemClick(item)}>
								<Icon color='primary' className={classes.icon} />
								{item.name}
							</MenuItem>
						</Hidden>
					)
				} else {
					return null
				}
			})}
		</MenuList>
	)

	return isMobile
		? (
			<SwipeableDrawer
				disableSwipeToOpen
				style={{ zIndex: 999999999 }}
				open={open}
				onClose={onClose}
				anchor='bottom'
			>
				<div style={{ marginLeft: 8 }}>
					{menuList}
				</div>
			</SwipeableDrawer>
		) : (
			<Popover
				open={open}
				onClose={onClose}
				anchorOrigin={anchorOrigin}
				transformOrigin={transformOrigin}
				{...PopoverProps}
				PaperProps={{ className: classes.paper }}
			>
				{menuList}
			</Popover>
		)
}

export default Menu