import { Card, CircularProgress, Fab, IconButton, LinearProgress, Typography, withStyles } from '@material-ui/core'
import { Close, CloudDownload, CloudUpload, ImportExport } from '@material-ui/icons'
import { humanFileSize } from '../../Utilities'
import React, { Component } from 'react'

class CloudTransfers extends Component {
	constructor(props) {
		super(props)
		this.state = { expanded: false }
	}

	render() {
		const { classes, open } = this.props
		const transfers = this.props.data
		const { expanded } = this.state
		const { sort } = this
		if(!open) return <div />

		let progress = 0
		Object.values(transfers).forEach(e => progress += e.progress)
		progress = progress / Object.values(transfers).length

		return (<>
			{ expanded &&
				<Card className={classes.card}>
					{sort(Object.values(transfers)).map(e => {
						return (<div key={e.id} className={classes.cardItem}>
							{e.type === 'upload' ? <CloudUpload className={classes.cardIcon} /> : <CloudDownload className={classes.cardIcon} />}
							<div className={classes.cardWrapper}>
								<Typography className={classes.typography} variant='subtitle2'>{e.name}</Typography>
								<LinearProgress variant='determinate' value={e.progress} />
								<div className={classes.speedWrapper}>
									{e.status ? (
										<Typography className={classes.typography2}>{e.status}</Typography>
									):(<>
									<Typography className={classes.typography2} >{humanFileSize(e.speed)}/s</Typography>
									<Typography className={classes.typography2} style={{ float: 'right' }}>{humanFileSize(e.loaded).split(' ')[0]}/{humanFileSize(e.total)}</Typography>
									</>)}
								</div>
							</div>
							<IconButton onClick={e.onCancel} className={classes.button}>
								<Close />
							</IconButton>
						</div>)
					})}
				</Card>
			}
			<Fab onClick={() => this.setState({ expanded: !expanded })} className={classes.fab} color='primary'>
				<ImportExport />
			</Fab>
			<CircularProgress thickness={2.5} color='inherit' className={classes.progress} variant='determinate' value={progress} />
		</>)
	}

	sort = arr => {
		arr.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0)
		arr.sort((a, b) => {
			const re = /\D/g
			return(parseInt(a.name.replace(re, ""), 10) - parseInt(b.name.replace(re, ""), 10))
		})
		return arr
	}
}

const styles = theme => ({
	fab: {
		bottom: theme.spacing(1),
		left: theme.spacing(1),
		position: 'fixed',
		zIndex: 99999,
		height: 40,
		width: 40,
		[theme.breakpoints.down('xs')]: {
			marginBottom: theme.spacing(6),
			bottom: theme.spacing(3),
			right: theme.spacing(2)
		}
	},
	progress: {
		bottom: theme.spacing(1),
		left: theme.spacing(1),
		pointerEvents: 'none',
		position: 'fixed',
		zIndex: 99999,
		height: 50,
		width: 50
	},
	card: {
		userSelect: 'none',
		padding: theme.spacing(2),
		bottom: theme.spacing(1),
		left: theme.spacing(8),
		position: 'fixed',
		maxHeight: 350,
		zIndex: 99999,
		width: 250,
		overflow: 'scroll',
		[theme.breakpoints.down('xs')]: {
			bottom: theme.spacing(10),
			width: 230
		}
	},
	cardItem: {
		display: 'flex'
	},
	cardIcon: {
		marginTop: theme.spacing(1),
		marginRight: theme.spacing(1)
	},
	cardWrapper: {
		overflow: 'hidden',
		width: '90%'
	},
	button: {
		marginLeft: theme.spacing(1),
		marginTop: theme.spacing(1.5),
		height: 10,
		width: 10
	},
	typography: {
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		overflow: 'hidden'
	},
	typography2: {
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		fontSize: 11
	},
	speedWrapper: {
		justifyContent: 'space-between',
		marginTop: theme.spacing(0.1),
		display: 'flex'
	}
})

export default withStyles(styles, { withTheme: true })(CloudTransfers)