/* eslint-disable react-hooks/exhaustive-deps */
import { Card, fade, Input, makeStyles } from '@material-ui/core'
import { AddCircleOutline, Send } from '@material-ui/icons'
import { useEffect, useRef } from 'react'
import { connect } from 'react-redux'

import ChatScroller from 'library/components/ChatScroller'
import randomToken from 'library/utilities/randomToken'
import IconButton from 'library/components/IconButton'
import indent from 'library/utilities/indent'

const useStyles = makeStyles((theme) => ({
	chatScroller: {
		marginBottom: theme.spacing(1),
		flexShrink: 9999,
		flexGrow: 1
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
	}
}))

function Channel({ id, channels, sendMessage }) {
	const classes = useStyles()
	const inputRef = useRef()

	const onMessageSend = () => {
		const input = inputRef.current?.value.replace(/(?:\r\n|\r|\n)/g, '\n')
		if (input.replace(/(?:\r\n|\r|\n|\t)/g, '').length < 1) return
		if (input.length > 2048) return
		const message = {
			channel_id: channel.id,
			content: input,
			reply_id: null,
			id: randomToken(24)
		}

		sendMessage(message)
		if (inputRef.current)
			inputRef.current.value = ''
	}

	const handleKeyDown = (e) => {
		if (e.key === 'Escape') {
			/* Scroll to bottom */
		} else if (e.key === 'Enter') {
			if (e.target !== inputRef.current) return
			if (e.shiftKey) return
			e.preventDefault()
			onMessageSend()
		} else if (e.key === 'ArrowUp') {
			/* Edit last message */
		} else {
			const isInputFocused = (document.activeElement === inputRef.current)
			if (isInputFocused || document.activeElement.tagName === 'INPUT') return
			inputRef.focus()
		}
	}

	useEffect(() => {
		indent(inputRef.current)
		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [])

	const channel = channels[id]
	if (!channel) return <div />
	const messages = Object.values(channel.messages).sort((a, b) => a.createdAt - b.createdAt)

	return (<>
		<ChatScroller
			className={classes.chatScroller}
			messages={messages}
			lastMessageId={channel.lastMessageId}
			firstMessageId={channel.firstMessageId}
		/>
		<Card className={classes.inputCard}>
			<IconButton tooltip='Attach Files' icon={AddCircleOutline} size={42} />
			<Input multiline disableUnderline placeholder='Send a Message' className={classes.input} inputRef={inputRef} />
			<IconButton tooltip='Send Message' icon={Send} onClick={onMessageSend} size={42} />
		</Card>
	</>)
}

const mapState = (state) => ({
	channels: state.channels
})
const mapDispatch = (dispatch) => ({
	sendMessage: dispatch.channels.sendMessage
})
export default connect(mapState, mapDispatch)(Channel)