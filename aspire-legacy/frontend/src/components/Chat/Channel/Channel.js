import { AddCircleOutlined, Send, Reply, FormatQuote, Room, Edit, Delete } from '@material-ui/icons'
import { Card, fade, Grid, Input, withStyles } from '@material-ui/core'
import manager from '../../../managers/messageManager'
import InfiniteScroll from 'react-infinite-scroller'
import ChannelMessage from './ChannelMessage'
import { indent } from '../../../Utilities'
import IconButton from '../../IconButton'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Dialog from '../../Dialog'
import Call from './Call/Call'
import Menu from '../../Menu'
import UserPopover from './User/UserPopover'
import CreateGroupPopover from './CreateGroupPopover'

class Channel extends Component {
	constructor(props) {
		super(props)
		this.state = {
			cursors: { y: null, x: null },
			deleteDialog: false
		}
		this.user = JSON.parse(localStorage.getItem('user'))
		this.inputRef = React.createRef()
		this.scrollRef = React.createRef()
		this.user = JSON.parse(localStorage.getItem('user'))
	}
	
	render() {
		const { getAvatar, sendMessage, onMessageContextMenu } = this
		const { cursors, deleteDialog } = this.state
		const { classes, loading, channel_id, channel: _channel } = this.props
		const channel = (_channel || { messages: [], total: 0, call: [] })
		const messages = channel.messages.sort((a, b) => a.createdAt - b.createdAt)

		return (<>
			<Call channel={channel} />
			<div className={classes.gridContainer} ref={this.scrollRef}>
				<InfiniteScroll
					hasMore={messages.length < channel.total}
					isReverse={true}
					pageStart={0}
					initialLoad={false}
					useWindow={false}
					threshold={500}
					loadMore={() => {
						if(loading) return
						// this.timeout = setTimeout(() => this.props.setLoading(true), 500)
						let lowestId = Infinity
						messages.forEach(e => {
							if(e.id < lowestId) lowestId = e.id
						})
						manager.fetch(channel_id, { before: lowestId })
					}}
				>
					{messages.map((message, i) => (
						<Grid item xs={12} style={{
							/* Add bottom padding if next message is from different author or if the message is 15 minutes apart */
							paddingBottom: (messages[i + 1]?.author !== message.author || messages[i + 1]?.createdAt - message.createdAt > 900) && 6,
						}} key={message.id} classes={{ root: classes.test }}>
							<ChannelMessage data={{
								message,
								last: messages[i - 1],
								next: messages[i + 1],
								onContextMenu: e => onMessageContextMenu(e, message),
								avatar: getAvatar(message),
								scrollToBottom: this.scrollToBottom
							 }} />
						</Grid>
					))}
				</InfiniteScroll>
			</div>
			<Card className={classes.inputCard}>
				<IconButton tooltip='Attach Files' icon={AddCircleOutlined} size={42} />
				<Input multiline disableUnderline placeholder='Send a Message' className={classes.input} inputRef={this.inputRef} />
				<IconButton tooltip='Send Message' icon={Send} onClick={sendMessage} size={42} />
			</Card>
			{/* <UserPopover
				cursors={{ x: 500, y: 500 }}
				offset={{ x: 0, y: 0 }}
				onClose={() => null}
				user={JSON.parse(localStorage.getItem('user'))}
			/> */}
			<Dialog
				title='Are you sure?'
				text="You won't be able to recover deleted Messages"
				open={deleteDialog}
				onSubmit={() => manager.delete(this.state.lastItem)}
				onClose={() => this.setState({ deleteDialog: false })}
			/>
			<Menu
				cursors={cursors}
				onClose={() => this.setState({ cursors: { y: null, x: null } })}
				items={[
					{ name: 'Reply', onClick: () => {}, icon: Reply },
					{ name: 'Quote', onClick: () => {}, icon: FormatQuote },
					{ name: 'Pin Message', onClick: () => {}, icon: Room },
					{ name: 'Edit Message', onClick: () => {}, icon: Edit, visible: this.state.lastItem?.author === this.user?.username },
					{ name: 'Delete Message', onClick: () => this.setState({ deleteDialog: true }), icon: Delete, visible: this.state.lastItem?.author === this.user?.username }
				]}
			/>
		</>)
	}

	componentDidMount = () => {
		const friend = Object.values(this.props.friends).find(e => e.channel_id === this.props.channel?.id)
		document.title = `@${friend?.username} - Aspire`
		window.addEventListener('keydown', this.onKeyDown)
		indent(this.inputRef.current)
		if(this.scrollRef.current) this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight
	}

	componentWillUnmount = () => {
		window.removeEventListener('keydown', this.onKeyDown)
	}

	componentDidUpdate = prevProps => {
		const channel = this.props.channel
		const prevChannel = prevProps.channel
		if(this.props.channel_id !== prevProps.channel_id || channel?.messages.length !== prevChannel?.messages.length) {
			this.scrollToBottom()
		}
	}

	scrollToBottom = () => {
		const channel = this.props.channel
		const ref = this.scrollRef.current
		if(!ref) return
		if(channel?.messages.length <= 50) ref.scrollTop = ref.scrollHeight
		else {
			if((ref.scrollHeight - ref.scrollTop) - 1100 < 0) {
				ref.scrollTop = ref.scrollHeight
			}
		}
	}

	getAvatar = message => {
		if(message.author === this.user.username) return `https://aspire.icu${this.user.avatar}`
		const friend = Object.values(this.props.friends).find(friend => friend.username === message.author)
		if(friend) return friend.avatar
		return null
	}

	onKeyDown = e => {
		if(e.key === 'Escape') {
			const ref = this.scrollRef.current
			if(!ref) return
			e.preventDefault()
			ref.scrollTop = ref.scrollHeight
		} else if(e.key === 'Enter') {
			const ref = this.inputRef.current
			if(!ref || e.target !== ref) return
			if(e.shiftKey) return this.scrollToBottom()
			e.preventDefault()
			this.sendMessage()
		} else if(e.key === 'ArrowUp') {
			/* Edit latest message */
		} else {
			const ref = this.inputRef.current
			const isFocused = (document.activeElement === ref)
			if(!ref || isFocused || document.activeElement.tagName === 'INPUT') return
			ref.focus()
		}
	}

	sendMessage = () => {
		const { channel_id } = this.props
		const input = this.inputRef.current?.value.replace(/(?:\r\n|\r|\n)/g, '\n')
		if(input.replace(/(?:\r\n|\r|\n|\t)/g, '').length < 1) return
		if(input.length > 2048) return
		const message = {
			channel_id: channel_id,
			attachemnts: [],
			author: this.user.username,
			content: input,
			createdAt: Math.round(Date.now() / 1000),
			editedAt: null,
			pinned: false
		}

		manager.send(message)
		if(this.inputRef.current) this.inputRef.current.value = ''
	}

	onMessageContextMenu = (e, item) => {
		e.preventDefault()
		this.setState({
			cursors: { x: e.clientX - 2, y: e.clientY - 4 },
			lastItem: item
		})
	}
}

const styles = theme => ({
	menuIcon: {
		marginLeft: -theme.spacing(1),
		marginRight: theme.spacing(1),
		pointerEvents: 'none'
	},
	gridContainer: {
		marginBottom: theme.spacing(1),
		overflow: 'scroll',
		flexGrow: 1,
		flexShrink: 9999
	},
	inputCard: {
		display: 'flex',
		padding: theme.spacing(0.5),
		marginBottom: -theme.spacing(1),
		flexGrow: 1,
		minHeight: 50
	},
	input: {
		backgroundColor: fade(theme.palette.common.black, 0.1),
		padding: theme.spacing(1),
		borderRadius: 6,
		maxHeight: 400,
		overflow: 'scroll',
		flexGrow: 1,
		width: '100%',
		marginBottom: theme.spacing(0.3),
		marginTop: theme.spacing(0.3),
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1)
	},
	test: {
		borderRadius: 0
	},
	button: {
		width: 42,
		height: 42
	},
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff'
	}
})

const mapStateToProps = state => ({
	friends: state.friends
})
const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withSnackbar(Channel)))