import { SelectAll, TextFields } from '@material-ui/icons'
import { useDispatch } from 'react-redux'

import Menu from 'library/components/Menu/Menu'

function InputMenu(props) {
	const { id, contextMenu } = props
	const { open, cursors, anchor, anchorOrigin, transformOrigin, item } = contextMenu
	const dispatch = useDispatch()

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
					name: 'Paste',
					onClick: () => {
						navigator.clipboard.readText()
							.then((text) => {
								const newCursorPos = item.selectionStart + text.length
								item.value = item.value.substring(0, item.selectionStart)
									+ text + item.value.substring(item.selectionEnd)
								if (item.placeholder === 'Search…')
									dispatch.searchInput.set(item.value)
								item.setSelectionRange(newCursorPos, newCursorPos)
							})
					},
					icon: TextFields
				},
				{
					name: 'Select all',
					onClick: () => {
						item.select()
					},
					icon: SelectAll
				}
			]}
		/>
	)
}

export default InputMenu