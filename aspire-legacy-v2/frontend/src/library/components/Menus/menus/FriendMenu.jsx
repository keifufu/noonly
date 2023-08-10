import { Block, Call, ChatBubble, Check, Person, RemoveCircle } from '@material-ui/icons'
import { useDispatch } from 'react-redux'

import Menu from 'library/components/Menu/Menu'

function FriendMenu(props) {
	const { id, contextMenu } = props
	const { open, cursors, anchor, anchorOrigin, transformOrigin, item } = contextMenu
	const dispatch = useDispatch()
	const friend = item

	return (
		<Menu
			open={open === id}
			cursors={cursors}
			anchor={anchor}
			anchorOrigin={anchorOrigin}
			transformOrigin={transformOrigin}
			onClose={dispatch.contextMenu.close}
			items={[
				{
					name: 'Profile',
					icon: Person,
					onClick: () => null
				},
				{
					name: 'Message',
					icon: ChatBubble,
					visible: !friend?.requestType,
					onClick: () => null
				},
				{
					name: 'Call',
					icon: Call,
					visible: !friend?.requestType,
					onClick: () => null
				},
				{
					name: 'Remove Friend',
					icon: RemoveCircle,
					visible: !friend?.requestType,
					onClick: () => dispatch.dialog.open({ id: 17, payload: friend })
				},
				{
					name: 'Block',
					icon: Block,
					visible: !friend?.requestType,
					onClick: () => null
				},
				{
					name: 'Cancel Request',
					icon: Block,
					visible: friend?.requestType && friend.requestType === 'outgoing',
					onClick: () => dispatch.friends.removeFriend({ user_id: friend.id })
				},
				{
					name: 'Accept Friend',
					icon: Check,
					visible: friend?.requestType && friend.requestType === 'incoming',
					onClick: () => dispatch.friends.acceptFriend({ username: friend.username })
				},
				{
					name: 'Deny Friend',
					icon: Block,
					visible: friend?.requestType && friend.requestType === 'incoming',
					onClick: () => dispatch.friends.removeFriend({ user_id: friend.id })
				}
			]}
		/>
	)
}

export default FriendMenu