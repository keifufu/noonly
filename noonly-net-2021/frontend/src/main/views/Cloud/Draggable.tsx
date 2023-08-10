import { Box } from '@chakra-ui/react'
import React from 'react'
import { RootState } from 'main/store/store'
import { useDraggable } from '@dnd-kit/core'
import { useSelector } from 'react-redux'

interface IProps {
	id: string
}

const Draggable: React.FC<IProps> = ({ id, children }) => {
	const { attributes, listeners, setNodeRef, isDragging, active } = useDraggable({ id })
	const selection = useSelector((state: RootState) => state.selection.files)
	const isActuallyDragging = isDragging || (selection.includes(active?.id || '') && selection.includes(id))

	return (
		<Box
			opacity={isActuallyDragging ? '0.5' : undefined}
			transition='all linear 0.1s'
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			style={{ touchAction: 'none' }}
			userSelect='none'
		>
			{children}
		</Box>
	)
}

export default Draggable