import { Avatar, Card, CardActionArea, CardHeader, Checkbox, Hidden, IconButton, Typography, withStyles } from '@material-ui/core'
import { MoreVert, Star, StarOutline } from '@material-ui/icons'
import { setInboxLoading } from '../../redux'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

class InboxItem extends Component {
	constructor(props) {
		super(props)
		this.state = {
			starHover: false
		}
	}
	
	render() {
		const { classes, data } = this.props
		const { starHover } = this.state
		const { onStarClick } = this
		const { item, selected, onContextMenu, onDoubleClick, onCheckboxChange, onActionClick } = data
		const { date, subject, from: _from, text, favorite } = item
		const from = { email: _from.value[0].address, name: _from.value[0].name.length > 0 ? _from.value[0].name : _from.value[0].address.split('@')[0] }

		return (
			<Card onContextMenu={onContextMenu} className={classes.card}>
				<CardActionArea>
					<Hidden xsDown>
						<div className={classes.root}>
							<div className={classes.startAction}>
								<Checkbox checked={selected.includes(item)} onChange={onCheckboxChange} color='primary' />
								<IconButton onClick={onStarClick} onMouseOver={() => this.setState({ starHover: true })} onMouseOut={() => this.setState({ starHover: false })} className={classes.starButton}>
									{ favorite ?
									starHover ? <StarOutline className={classes.star} /> : <Star className={classes.star} /> :
									starHover ? <Star className={classes.star} /> : <StarOutline className={classes.star} /> }
								</IconButton>
							</div>
							<div className={classes.content} onDoubleClick={onDoubleClick}>
								<Typography className={classes.from} variant='body1'>
									{from.name}
								</Typography>
								<div className={classes.textWrapper}>
									<Typography noWrap variant='body1' component='span' display='block' className={classes.subject}>
										{subject}
									</Typography>
									{text?.length > 0 &&
									<Typography noWrap variant='body2' color='textSecondary' component='span' display='block' className={classes.text}>
										{`- ${text}`}
									</Typography>}
								</div>
							</div>
							<div className={classes.action}>
								<Typography variant='body2' color='textSecondary' component='span' className={classes.date}>
									{moment.unix(Date.parse(date) / 1000).format('MMM DD YYYY[,] hh:mm')}
								</Typography>
								<IconButton onClick={onActionClick}>
									<MoreVert />
								</IconButton>
							</div>
						</div>
					</Hidden>
					<Hidden smUp>
						<CardHeader
							avatar={<Avatar />}
							title={from.name}
							titleTypographyProps={{ onDoubleClick: onDoubleClick, noWrap: true }}
							subheader={subject}
							subheaderTypographyProps={{ onDoubleClick: onDoubleClick, noWrap: true }}
							action={<>
								{/* <Typography variant='body2' color='textSecondary' component='span' className={classes.date}>
									{moment.unix(Date.parse(date) / 1000).format('MMM DD YYYY[,] hh:mm')}
								</Typography> */}
								<IconButton onClick={onStarClick}>
									{ favorite ? <Star /> : <StarOutline /> }
								</IconButton>
							</>}
						/>
					</Hidden>
				</CardActionArea>
			</Card>
		)
	}
	
	onStarClick = e => this.props.data.setFavorite(!this.props.data.item.favorite)
}

const styles = theme => ({
	card: {
		backgroundColor: props => props.data.selected?.includes(props.data.item) ? theme.palette.grey[theme.palette.type === 'dark' ? '800' : '300'] : '',
	},
	root: {
		display: 'flex',
		alignItems: 'center',
		padding: 8
	},
	content: {
		display: 'flex',
		flex: '1 1 auto',
		overflow: 'hidden'
	},
	from: {
		flexBasis: '15%',
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
		paddingRight: theme.spacing(2),
		fontWeight: props => !props.data.item?.read && 'bold',
	},
	textWrapper: {
		display: 'flex',
		overflow: 'hidden',
		flexBasis: '85%',
		paddingRight: theme.spacing(2),
		alignItems: 'center'
	},
	subject: {
		paddingRight: 4,
		fontWeight: props => !props.data.item?.read && 'bold',
	},
	text: {
		flexShrink: 999999999,
		fontWeight: props => !props.data.item?.read && 'bold',
	},
	startAction: {
		flex: '0 0 auto',
		alignSelf: 'flex-start',
		marginTop: 3,
		marginRight: 8
	},
	action: {
		flex: '0 0 auto',
		alignSelf: 'flex-start'
	},
	starButton: {
		float: 'right',
		padding: 0,
		marginTop: theme.spacing(1)
	},
	star: {
		pointerEvents: 'none'
	},
	date: {
		whiteSpace: 'nowrap',
		fontWeight: props => !props.data.item?.read && 'bold',
		color: props => !props.data.item?.read && 'white'
	},
})

const mapStateToProps = state => ({})
const mapDispatchToProps = dispatch => ({
	setLoading: value => dispatch(setInboxLoading(value))
})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withSnackbar(InboxItem)))