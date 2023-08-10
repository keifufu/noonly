import { AppBar, fade, Hidden, InputBase, makeStyles, Toolbar } from '@material-ui/core'
import { Search, Settings } from '@material-ui/icons'
import { connect } from 'react-redux'
import { useRef } from 'react'

import IconButton from 'library/components/IconButton'

const useStyles = makeStyles((theme) => ({
	appbar: {
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		}),
		[theme.breakpoints.down('xs')]: {
			width: 'calc(100% - 15px)',
			top: theme.spacing(1),
			margin: theme.spacing(0, 1, 1, 1),
			borderRadius: 10
		}
	},
	buttons: {
		display: 'flex'
	},
	hamburger: {
		[theme.breakpoints.up('sm')]: {
			marginLeft: -theme.spacing(2) - 3
		}
	},
	title: {
		flexGrow: 1,
		display: 'none',
		[theme.breakpoints.up('sm')]: {
			display: 'block'
		},
		userSelect: 'none',
		marginLeft: theme.spacing(2)
	},
	search: {
		userSelect: 'none',
		position: 'relative',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.25)
		},
		marginLeft: 0,
		[theme.breakpoints.down('xs')]: {
			margin: theme.spacing(0, 0.5, 0, 0.5),
			width: '100%'
		},
		[theme.breakpoints.up('sm')]: {
			marginRight: theme.spacing(2),
			marginLeft: theme.spacing(3),
			width: 'auto'
		}
	},
	searchIcon: {
		paddingLeft: theme.spacing(2),
		justifyContent: 'center',
		pointerEvents: 'none',
		position: 'absolute',
		alignItems: 'center',
		display: 'flex',
		height: '100%'
	},
	inputRoot: {
		color: 'inherit'
	},
	inputInput: {
		paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
		transition: theme.transitions.create('width'),
		padding: theme.spacing(1, 1, 1, 0),
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			width: '16ch',
			'&:focus': {
				width: '20ch'
			}
		}
	},
	spacer: {
		backgroundColor: theme.palette.background.default,
		minHeight: theme.spacing(1),
		position: 'fixed',
		width: '100%',
		zIndex: 1000,
		top: 0
	}
}))

function Header({ searchInput, setSearchInput, openContextMenu }) {
	const classes = useStyles()
	const profileButtonRef = useRef()

	const onSettingsClick = (e) => {
		openContextMenu({
			id: 1,
			anchor: profileButtonRef.current
		})
	}

	return (<>
		<Hidden smUp><div className={classes.spacer} /></Hidden>
		<AppBar color='inherit' className={classes.appbar}>
			<Toolbar>
				<div className={classes.search}>
					<div className={classes.searchIcon}>
						<Search />
					</div>
					<InputBase
						autoFocus
						placeholder='Search…'
						spellCheck='false'
						classes={{ root: classes.inputRoot, input: classes.inputInput }}
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
				</div>
				<div className={classes.buttons}>
					<IconButton buttonRef={profileButtonRef} onClick={onSettingsClick} icon={Settings} />
				</div>
			</Toolbar>
		</AppBar>
	</>)
}

const mapState = (state) => ({
	searchInput: state.searchInput
})
const mapDispatch = (dispatch) => ({
	setSearchInput: dispatch.searchInput.set,
	openContextMenu: dispatch.contextMenu.open
})
export default connect(mapState, mapDispatch)(Header)