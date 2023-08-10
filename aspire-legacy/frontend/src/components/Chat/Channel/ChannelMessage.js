import { Avatar, Card, fade, Input, Link, Tooltip, Typography, withStyles } from '@material-ui/core'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import ReactMarkdown from 'react-markdown'
import equal from 'fast-deep-equal/react'
import React, { Component } from 'react'
import LinkEmbed from './LinkEmbed'
import PropTypes from 'prop-types'
import gfm from 'remark-gfm'
import 'moment/locale/en-gb'
import moment from 'moment'

class ChannelMessage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			isHovering: false,
			edit: ''
		}
	}

	render() {
		const { onChange } = this
		const { isHovering, edit } = this.state
		const { classes, data } = this.props
		const { message, onContextMenu, last, next, avatar, scrollToBottom } = data
		const { type, /* attachments,  */author, content, createdAt, editedAt } = message
		let tooltip = moment.unix(createdAt).format('dddd[,] D MMMM YYYY[,] LT')
		let editedTooltip = moment.unix(parseInt(editedAt)).format('dddd[,] D MMMM YYYY[,] LT')
		
		let time = moment.unix(createdAt).calendar()

		const systemMessage = type !== 0
		const hideTop = ((last?.author === message.author) && (message.createdAt - last?.createdAt < 900)) || systemMessage
		const hideBottom = (next?.author === message.author) && (next?.createdAt - message.createdAt < 900)
		let boxShadow = null
		if(hideBottom) boxShadow = 'none'
		if(hideTop && (next?.author !== message.author || next?.createdAt - message.createdAt > 900)) {
			boxShadow = '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px -10px rgba(0,0,0,0.14), 0px 1px 3px -10px rgba(0,0,0,0.12)'
		}
		const cardStyle = {
			borderTopLeftRadius: hideTop && 0,
			borderTopRightRadius: hideTop && 0,
			borderBottomLeftRadius: hideBottom && 0,
			borderBottomRightRadius: hideBottom && 0,
			boxShadow: boxShadow && boxShadow,
			paddingTop: hideTop && 2
		}

		const renderers = {
			code: ({ language, value }) => {
				if(!value) return ''
				return <SyntaxHighlighter
					style={dracula}
					language={language}
					children={value}
					customStyle={{
						padding: '0.7em',
						margin: 4,
						marginLeft: 0,
						background: '#292c38'
					}}
				/>
			},
			inlineCode: ({ value }) => {
				return <SyntaxHighlighter
					style={dracula}
					children={value}
					customStyle={{
						padding: '0.5em',
						margin: 4,
						marginLeft: 0,
						background: '#292c38'
					}}
				/>
			},
			link: ({ href }) => {
				return (<>
					<Link href={href}>{href}</Link>
					<LinkEmbed scrollToBottom={scrollToBottom} url={href} />
				</>)
			}
		}
		const markdownTypesAllowed = [ 'text', 'emphasis', 'strong', 'link', 'inlineCode', 'code', 'delete' ]

		return (
			<Card onMouseEnter={() => this.setState({ isHovering: true })} onMouseLeave={() => this.setState({ isHovering: false })} className={classes.card} style={cardStyle} onContextMenu={onContextMenu}>
				<div className={classes.root}>
					<div className={classes.avatar}>
					{!hideTop ?
						<Avatar src={avatar} /> :
						!isHovering ? <div className={classes.placeholder} /> :
						<Tooltip title={tooltip} placement='top' enterDelay={500}>
							<div className={classes.timePreview}>
								{moment.unix(createdAt).format('LT')}
							</div>
						</Tooltip>}
					</div>
					<div className={classes.content}>
					{!hideTop &&
						<div className={classes.title}>
							<Typography style={{ fontWeight: '500' }} variant='body2' component='span' display='block'>
								{author}
							</Typography>
							<Tooltip title={tooltip} placement='top' enterDelay={500}>
								<Typography variant='body2' className={classes.time} component='span' display='block'>
									{time}
								</Typography>
							</Tooltip>
						</div>}
						<div className={classes.msg_content}>
							{false
							? <Input placeholder='Edit message' value={edit} onChange={onChange} />
							: <ReactMarkdown
									className={classes.line_break}
									skipHtml
									allowedTypes={markdownTypesAllowed}
									unwrapDisallowed
									renderers={renderers}
									plugins={[[gfm, { singleTilde: false }]]}
									children={content} />
							}
							{editedAt !== 'null' && editedAt !== null && (
								<Tooltip title={editedTooltip} placement='top' enterDelay={0}>
									<Typography variant='body2' className={classes.edited} component='span' display='block'>
										(edited)
									</Typography>
								</Tooltip>
							)}
						</div>
					</div>
					{/* <div className={classes.action}>
					</div> */}
				</div>
			</Card>
		)
	}

	shouldComponentUpdate = (nextProps, nextState) => {
		let update = false
		if(!equal(nextProps.data, this.props.data)) update = true
		if(!equal(nextProps.classes, this.props.classes)) update = true
		if(!equal(nextState, this.state)) update = true
		return update
	}

	componentDidMount = () => {
		this.setState({ edit: this.props.data?.message.content })
	}

	onChange = e => {
		this.setState({ edit: e.target.value })
	}
}

const styles = theme => ({
	card: {
		'&:hover': {
			backgroundColor: fade(theme.palette.common.black, 0.1),
		}
	},
	root: {
		display: 'flex',
		alignItems: 'center',
		padding: props => (props.data.last?.author === props.data.message.author && props.data.message.createdAt - props.data.last?.createdAt < 900) ? 0 : 8,
		paddingLeft: props => props.data.message.type !== 0 && 0,
		paddingBottom: props => (props.data.next?.author !== props.data.message.author || props.data.next?.createdAt - props.data.message.createdAt > 900) ? 8 : 2,
	},
	avatar: {
		display: 'flex',
		flex: '0 0 auto',
		marginRight: 16,
		alignSelf: 'start'
	},
	action: {
		flex: '0 0 auto',
		alignSelf: 'flex-start',
		marginTop: -4,
		marginRight: -8,
		marginBottom: -4
	},
	content: {
		flex: '1 1 auto'
	},
	msg_content: {
		display: 'flex'
	},
	title: {
		display: 'flex',
		alignItems: 'center'
	},
	subheader: {
		wordWrap: 'break-word',
		marginRight: theme.spacing(2)
	},
	time: {
		marginLeft: theme.spacing(1),
		fontSize: 12,
		color: '#abafaa'
	},
	edited: {
		fontSize: 8,
		color: '#abafaa'
	},
	placeholder: {
		marginLeft: theme.spacing(6)
	},
	timePreview: {
		width: theme.spacing(2),
		marginLeft: theme.spacing(4),
		color: '#9e9e9e',
		fontSize: 10,
		marginTop: theme.spacing(0.25)
	},
	line_break: {
		color: props => props.data.message.sent === false && 'grey',
		whiteSpace: 'pre-wrap',
		marginBottom: props => (props.data.next?.author !== props.data.message.author || props.data.next?.createdAt - props.data.message.createdAt > 900) && -4
	}
})

ChannelMessage.propTypes = {
	data: PropTypes.shape({
		message: PropTypes.object,
		onContextMenu: PropTypes.func,
		last: PropTypes.object,
		next: PropTypes.object
	}).isRequired
}

export default withStyles(styles, { withTheme: true })(ChannelMessage)