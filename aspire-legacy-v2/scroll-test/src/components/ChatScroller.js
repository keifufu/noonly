import { makeStyles } from '@material-ui/core/styles'
import { useEffect, useRef, useState } from 'react'
import { CircularProgress } from '@material-ui/core'
import Message from './Message'
import { debounce } from 'lodash'

const useStyles = makeStyles((theme) => ({
	root: {
		height: 750,
		width: 750,
		overflow: 'scroll',
		padding: theme.spacing(0.5)
	}
}))

function ChatScroller({ messages: _messages, getMoreMessages, newestMessageId, oldestMessageId }) {
	const classes = useStyles()
	const messages = _messages.sort((a, b) => a.createdAt - b.createdAt)
	const [mounted, setMounted] = useState(false)
	const scrollRef = useRef()
	const hasMoreDownwards = !messages.find((e) => e.id === newestMessageId)
	const hasMoreUpwards = !messages.find((e) => e.id === oldestMessageId)
	const [loadingBottom, setLoadingBottom] = useState(false)
	const [loadingTop, setLoadingTop] = useState(false)

	useEffect(() => {
		if (!mounted) {
			setMounted(true)
			scrollRef.current.scrollTop = 9999999
		}
	}, [mounted])

	const handleScroll = (e) => {
		const bottom = (e.target.scrollHeight - e.target.scrollTop) - 1100 < 0
		if (bottom && !loadingBottom && hasMoreDownwards) {
			setLoadingBottom(true)
			console.log("Loading newer messages")
			let createdAt = 0
			messages.forEach((e) => {
				if (e.createdAt > createdAt) createdAt = e.createdAt
			})
			const messageId = messages.find((e) => e.createdAt === createdAt).id
			getMoreMessages(setLoadingBottom, scrollRef, { after: messageId })
		}
		const top = (e.target.scrollTop < 1100)
		console.log(top)
		if (top && !loadingTop && hasMoreUpwards) {
			setLoadingTop(true)
			console.log("Loading older messages")
			let createdAt = Infinity
			messages.forEach(e => {
				if(e.createdAt < createdAt) createdAt = e.createdAt
			})
			const messageId = messages.find((e) => e.createdAt === createdAt).id
			getMoreMessages(setLoadingTop, scrollRef, { before: messageId })
		}
	}

	const scrollHandler = debounce(handleScroll, 100)

	return (
		<div
			className={classes.root}
			onScroll={scrollHandler}
			ref={scrollRef}
		>
			{loadingTop && <CircularProgress />}
			{messages.map((e) => (
				<Message {...e} id={e.id} key={e.id} />
			))}
			{loadingBottom && <CircularProgress />}
		</div>
	)
}

export default ChatScroller