import { makeStyles } from '@material-ui/core/styles'
import { useState } from 'react';
import ChatScroller from "./components/ChatScroller"
import messages from './messages.json'

const useStyles = makeStyles((theme) => ({
	root: {
		overflow: 'hidden',
		display: 'flex',
		padding: theme.spacing(3),
		justifyContent: 'center'
	},
	'@global': {
		'*::-webkit-scrollbar': {
			// display: 'none !important'
		},
		'a[href]': {
			color: theme.palette.primary.main,
			textDecoration: 'none',
			'&:hover': {
				textDecoration: 'underline'
			}
		},
		/**
		 * Do not remove this under ANY circumstance
		 * Removing these will cause some flex items to go off-screen
		 * Only God knows why, though.
		 */
		'*': {
			minWidth: 0,
			minHeight: 0
		}
	}
}))

function getMessages(options) {
	if (options?.before) {
		/* Get 50 messages created before specified message id */
		const beforeMessage = messages.find((e) => e.id === options.before)
		return messages.filter((e) => e.createdAt < beforeMessage.createdAt).sort((a, b) => b.createdAt - a.createdAt).slice(0, 50)
	} else if (options?.after) {
		/* Get 50 messages created after specified message id */
		const afterMessage = messages.find((e) => e.id === options.after)
		return messages.filter((e) => e.createdAt > afterMessage.createdAt).sort((a, b) => a.createdAt - b.createdAt).slice(0, 50)
	} else {
		/* Get last 50 messages */
		return messages.sort((a, b) => a.createdAt - b.createdAt).slice(messages.length - 50, messages.length)
	}
}

function getOldestMessageId() {
	let createdAt = Infinity
	messages.forEach((e) => {
		if (e.createdAt < createdAt) createdAt = e.createdAt
	})
	const messageId = messages.find((e) => e.createdAt === createdAt).id
	return messageId
}

function getNewestMessageId() {
	let createdAt = 0
	messages.forEach((e) => {
		if (e.createdAt > createdAt) createdAt = e.createdAt
	})
	const messageId = messages.find((e) => e.createdAt === createdAt).id
	return messageId
}

function App() {
	const classes = useStyles()
	const [messages, setMessages] = useState(getMessages())

	let oldestMessageId = getOldestMessageId()
	let newestMessageId = getNewestMessageId()

	const getMoreMessages = (setLoading, scrollRef, options) => {
		if (options.before) {
			setTimeout(() => {
				/* If there are over 150 messages remove 50 newest */
				if (messages.length >= 150) {
					let newMessages = messages.sort((a, b) => b.createdAt - a.createdAt).slice(50)
					setMessages([...getMessages(options), ...newMessages])
				} else {
					setMessages([...getMessages(options), ...messages])
				}
				const el = document.getElementById(options.before)
				if (el) el.scrollIntoView()
				scrollRef.current.scrollTop -= 100
				setTimeout(() => {
					setLoading(false)
				}, 100)
			}, 750)
		}
		if (options.after) {
			setTimeout(() => {
				/* If there are over 150 messages remove 50 oldest */
				if (messages.length >= 150) {
					let newMessages = messages.sort((a, b) => a.createdAt - b.createdAt).slice(50)
					setMessages([...newMessages, ...getMessages(options)])
				} else {
					setMessages([...messages, ...getMessages(options)])
				}
				const el = document.getElementById(options.after)
				if (el) el.scrollIntoView()
				scrollRef.current.scrollTop -= (scrollRef.current.clientHeight * 0.85)
				setTimeout(() => {
					setLoading(false)
				}, 100)
			}, 750)
		}
	}

	return (
		<div className={classes.root}>
			<ChatScroller
				messages={messages}
				getMoreMessages={getMoreMessages}
				oldestMessageId={oldestMessageId}
				newestMessageId={newestMessageId}
			/>
		</div>
	)
}

export default App