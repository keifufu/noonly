import { MdFolder, MdFolderShared, MdInsertDriveFile } from 'react-icons/md'
import { useHistory, useLocation } from 'react-router-dom'

import { Box } from '@chakra-ui/react'
import { Dispatch } from 'main/store/store'
import { SelectionTypes } from '@types'
import { memo } from 'react'
import { useDispatch } from 'react-redux'

interface IProps {
	file: Noonly.API.Data.File,
	isSelected?: boolean
}

const FileCard: React.FC<IProps> = memo(({ file, isSelected }) => {
	const history = useHistory()
	const location = useLocation()
	const dispatch: Dispatch = useDispatch()

	return (
		<Box
			flex='1'
			maxWidth='20vw'
			rounded='md'
			p='3'
			bg={isSelected ? 'blue.600' : 'gray.700'}
			transform={isSelected ? 'scale(0.95)' : undefined}
			transition='all linear 0.1s'
			display='flex'
			alignItems='center'
			cursor='pointer'
			onClick={(e) => {
				if (e.ctrlKey)
					dispatch.selection.toggleSelection({ type: SelectionTypes.FILES, id: file.id })
				else if (file.isFolder)
					history.push(`${location.pathname.split('/').slice(0, 3).join('/')}/${file.id}`)
			}}
			onContextMenu={(e) => {
				e.stopPropagation()
				dispatch.contextMenu.open({ id: 6, e, data: file })
			}}
		>
			{file.isFolder ? file.sharedWith.length > 0 ? (
				<Box h='8' mr='2'>
					<MdFolderShared size='32' />
				</Box>
			) : (
				<Box h='8' mr='2'>
					<MdFolder size='32' />
				</Box>
			) : (
				<Box h='8' mr='2'>
					<MdInsertDriveFile size='32' />
				</Box>
			)}
			<Box
				fontWeight={600}
				overflow='hidden'
				textOverflow='ellipsis'
				whiteSpace='nowrap'
			>
				{file.name}
			</Box>
		</Box>
	)
}, (a, b) => {
	if (a.file.name !== b.file.name)
		return false
	if (a.isSelected !== b.isSelected)
		return false
	return true
})

export default FileCard