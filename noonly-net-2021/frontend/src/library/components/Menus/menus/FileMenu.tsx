import { Dispatch, RootState } from 'main/store/store'
import { MdAssignment, MdDelete, MdDeleteForever, MdEdit, MdFileDownload, MdOpenWith, MdRestore, MdShare, MdVisibility } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'

import ContextMenu from 'library/components/ContextMenu'
import ContextMenuItem from 'library/components/ContextMenuItem'
import ContextMenuList from 'library/components/ContextMenuList'
import { ContextMenuProps } from 'library/components/ContextMenu/ContextMenu'
import { FaCopy } from 'react-icons/fa'
import Invisible from 'library/components/Invisible'
import { SelectionTypes } from '@types'
import { memo } from 'react'
import nodePath from 'path'
import { onSubmitProps } from 'library/components/Modals/modals/AlertModal'
import textExtensions from 'text-extensions'

const FileMenu: React.FC<ContextMenuProps> = memo(({ id, contextMenu }) => {
	const file = contextMenu.data
	const dispatch: Dispatch = useDispatch()
	const selection = useSelector((state: RootState) => state.selection.files)

	const fileExt = nodePath.extname(file.name).slice(0).toLowerCase()
	const isImageFile = !file.isFolder && ['jpg', 'jpeg', 'jfif', 'png', 'webm', 'webp', 'gif'].includes(fileExt)
	const isTextFile = !file.isFolder && textExtensions.includes(fileExt)

	const ids = selection.length > 0 && selection.includes(file.id) ? selection : [file.id]
	const resetSelection = () => {
		if (!ids.includes(file.id)) return
		dispatch.selection.setSelection({ type: SelectionTypes.FILES, ids: [] })
	}

	return (
		<ContextMenu id={id} contextMenu={contextMenu}>
			<ContextMenuList>
				<Invisible invisible={ids.length > 1}>
					<ContextMenuItem
						rIcon={MdEdit}
						onClick={() => dispatch.modal.open({ id: 7, data: file })}
					>
						Rename
					</ContextMenuItem>
				</Invisible>
				<Invisible invisible={!isTextFile || ids.length > 1}>
					<ContextMenuItem
						// TODO: Functionality
						rIcon={MdAssignment}>
							Edit
					</ContextMenuItem>
				</Invisible>
				<Invisible invisible={!isImageFile || ids.length > 1}>
					<ContextMenuItem
						// TODO: Functionality
						rIcon={MdVisibility}>
							View
					</ContextMenuItem>
				</Invisible>
				<Invisible invisible={ids.length > 1}>
					<ContextMenuItem
						onClick={() => dispatch.modal.open({ id: 10, data: file })}
						rIcon={MdShare}>
							Share
					</ContextMenuItem>
				</Invisible>
				<ContextMenuItem
					// TODO: Functionality
					rIcon={MdFileDownload}>
						Download
				</ContextMenuItem>
				<ContextMenuItem
					// TODO: Functionality
					rIcon={MdOpenWith}>
						Move
				</ContextMenuItem>
				<ContextMenuItem
					// TODO: Functionality
					rIcon={FaCopy}>
						Copy
				</ContextMenuItem>
				<Invisible invisible={file.trash}>
					<ContextMenuItem
						onClick={() => {
							dispatch.files.editTrash({ ids, trash: true })
							resetSelection()
						}}
						rIcon={MdDelete}>
						Move to Trash
					</ContextMenuItem>
				</Invisible>
				<Invisible invisible={!file.trash}>
					<ContextMenuItem
						onClick={() => {
							dispatch.files.editTrash({ ids, trash: false })
							resetSelection()
						}}
						rIcon={MdRestore}>
						Restore
					</ContextMenuItem>
				</Invisible>
				<Invisible invisible={!file.trash}>
					<ContextMenuItem
						alert
						rIcon={MdDeleteForever}
						onClick={() => {
							dispatch.modal.open({
								id: 9,
								data: {
									header: 'Delete Files?',
									text: 'Are you sure you want to delete these Files? You cannot undo this action afterwards.',
									buttons: ['Cancel', 'Delete'],
									onSubmit: ({ onSuccess, onFail }: onSubmitProps) => {
										dispatch.files.delete({ ids, onSuccess, onFail })
									}
								}
							})
						}}
					>
						Delete
					</ContextMenuItem>
				</Invisible>
			</ContextMenuList>
		</ContextMenu>
	)
}, (prevProps, nextProps) => {
	if (nextProps.contextMenu.id !== nextProps.id
		&& prevProps.contextMenu.cursors !== nextProps.contextMenu.cursors)
		return true
	return false
})

export default FileMenu