import { useDropzone } from 'react-dropzone'
import { useDispatch } from 'react-redux'
import { useCallback, useMemo } from 'react'

const baseStyle = {
	transition: 'border .24s ease-in-out',
	borderWidth: 2,
	borderRadius: 2,
	borderStyle: 'dashed',
	borderColor: 'transparent'
}

const activeStyle = {
	borderColor: '#2196f3'
}

const acceptStyle = {
	borderColor: '#00e676'
}

const rejectStyle = {
	borderColor: '#ff1744'
}

function CloudDropzone({ children, currentParentId }) {
	const dispatch = useDispatch()

	const onDrop = useCallback((files) => {
		files.forEach((file) => {
			dispatch.cloud.uploadFile({
				parent_id: currentParentId,
				file
			})
		})
	}, [currentParentId, dispatch.cloud])
	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragAccept,
		isDragReject
	} = useDropzone({ noClick: true, onDrop })

	const style = useMemo(() => ({
		...baseStyle,
		...(isDragActive ? activeStyle : {}),
		...(isDragAccept ? acceptStyle : {}),
		...(isDragReject ? rejectStyle : {})
	}), [
		isDragActive,
		isDragReject,
		isDragAccept
	])

	return (
		<div {...getRootProps({ style })}>
			<input {...getInputProps()} />
			{children}
		</div>
	)
}

export default CloudDropzone