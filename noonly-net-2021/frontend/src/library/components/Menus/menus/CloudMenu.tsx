import { MdCloudUpload, MdCreateNewFolder, MdInsertDriveFile, MdRefresh } from 'react-icons/md'

import ContextMenu from 'library/components/ContextMenu'
import ContextMenuItem from 'library/components/ContextMenuItem'
import ContextMenuList from 'library/components/ContextMenuList'
import { ContextMenuProps } from 'library/components/ContextMenu/ContextMenu'
import { Dispatch } from 'main/store/store'
import { memo } from 'react'
import socket from 'main/socket'
import { useDispatch } from 'react-redux'

const CloudMenu: React.FC<ContextMenuProps> = memo(({ id, contextMenu }) => {
	const { parentId } = contextMenu.data
	const dispatch: Dispatch = useDispatch()

	return (
		<ContextMenu id={id} contextMenu={contextMenu}>
			<ContextMenuList>
				<ContextMenuItem
					rIcon={MdRefresh}
					onClick={() => socket.emit('LOAD_FILES')}
				>
					Refresh
				</ContextMenuItem>
				<ContextMenuItem
					rIcon={MdCreateNewFolder}
					onClick={() => dispatch.modal.open({ id: 7, data: { parentId, isFolder: true } })}
				>
					New Folder
				</ContextMenuItem>
				<ContextMenuItem
					rIcon={MdInsertDriveFile}
					onClick={() => dispatch.modal.open({ id: 7, data: { parentId, isFolder: false } })}
				>
					New File
				</ContextMenuItem>
				<ContextMenuItem
					rIcon={MdCloudUpload}
				>
					Upload Files
				</ContextMenuItem>
			</ContextMenuList>
		</ContextMenu>
	)
}, (prevProps, nextProps) => {
	if (nextProps.contextMenu.id !== nextProps.id
		&& prevProps.contextMenu.cursors !== nextProps.contextMenu.cursors)
		return true
	return false
})

export default CloudMenu