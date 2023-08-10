import { CircularProgress, makeStyles, Typography } from '@material-ui/core'
import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import clsx from 'clsx'

import ChannelMessage from 'library/components/ChannelMessage'
import { debounce } from 'library/utilities/lodash'

const useStyles = makeStyles((theme) => ({
	root: {
		overflowY: 'scroll',
		overflowX: 'hidden',
		/* Adjust padding for scrollbar */
		paddingRight: theme.spacing(0.7),
		'&::-webkit-scrollbar': {
			display: 'block !important',
			width: 10
		},
		'&::-webkit-scrollbar-track': {
			background: theme.palette.background.paper
		},
		'&::-webkit-scrollbar-thumb': {
			background: theme.palette.tonalOffset.dark,
			borderRadius: 5
		},
		'&::-webkit-scrollbar-thumb:hover': {
			background: theme.palette.divider
		}
	}
}))

function ChatScroller({ messages: _messages, className, fetchMessages, lastMessageId, firstMessageId }) {
	const classes = useStyles()
	const [loadingTop, setLoadingTop] = useState(false)
	const [loadingBottom, setLoadingBottom] = useState(false)

	const messages = _messages.sort((a, b) => a.createdAt - b.createdAt)
	const hasNewerMessages = !messages.find((e) => e.id === lastMessageId)
	const hasOlderMessages = !messages.find((e) => e.id === firstMessageId)

	const scrollRef = useRef()

	useEffect(() => {
		scrollRef.current.scrollTop = 9999999
	}, [])

	const scrollHandler = debounce((e) => {
		const bottomTrigger = (e.target.scrollHeight - e.target.scrollTop) - 1100 < 0
		if (bottomTrigger && !loadingBottom && hasNewerMessages) {
			setLoadingBottom(true)
			let createdAt = 0
			messages.forEach((e) => {
				if (e.createdAt > createdAt)
					// eslint-disable-next-line prefer-destructuring
					createdAt = e.createdAt
			})
			const messageId = messages.find((e) => e.createdAt === createdAt).id
			fetchMessages({ after: messageId }, () => {
				document.getElementById(messageId)?.scrollIntoView()
				scrollRef.current.scrollTop -= 100
				setLoadingBottom(false)
			})
		}

		const topTrigger = e.target.scrollTop < 1100
		if (topTrigger && !loadingTop && hasOlderMessages) {
			setLoadingTop(true)
			let createdAt = Infinity
			messages.forEach((e) => {
				if (e.createdAt < createdAt)
					// eslint-disable-next-line prefer-destructuring
					createdAt = e.createdAt
			})
			const messageId = messages.find((e) => e.createdAt === createdAt).id
			fetchMessages({ before: messageId }, () => {
				document.getElementById(messageId)?.scrollIntoView()
				scrollRef.current.scrollTop -= (scrollRef.current.clientHeight * 0.85)
				setLoadingTop(false)
			})
		}
	}, 100)

	const _className = clsx(classes.root, className)
	return (
		<div
			className={_className}
			onScroll={scrollHandler}
			ref={scrollRef}
		>
			{
				!hasOlderMessages
				&& <div>
					<Typography variant='body1'>
						You have reached the start
					</Typography>
				</div>
			}
			{loadingTop && <CircularProgress />}
			{ messages.map((e) => (
				<ChannelMessage {...e} key={e.id} />
			)) }
			{loadingBottom && <CircularProgress />}
		</div>
	)
}

const mapState = (state) => ({
})
const mapDispatch = (dispatch) => ({
	fetchMessages: dispatch.channels.fetchMessages
})
export default connect(mapState, mapDispatch)(ChatScroller)