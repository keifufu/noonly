import { Box } from '@chakra-ui/layout'
import { Dispatch } from 'main/store/store'
import Dropzone from 'react-dropzone'
import { chakra } from '@chakra-ui/system'
import { useDispatch } from 'react-redux'

interface IProps {
	parentId: string
}

const CloudDropzone: React.FC<IProps> = ({ parentId, children }) => {
	const dispatch: Dispatch = useDispatch()

	const handleDrop = (files: File[]) => {
		files.forEach((file) => {
			/* TODO: Check if file already exists in folder, and open modal */
			dispatch.files.upload({
				parentId: parentId,
				file
			})
		})
	}

	return (
		<Dropzone
			onDropAccepted={handleDrop}
			noClick
			noKeyboard
		>
			{({ getRootProps, getInputProps, isDragAccept, isDragReject }) => (
				<chakra.div {...getRootProps()}>
					<Box
						border='4px dashed'
						borderRadius='14px'
						/* #2F855A is green.600 */
						/* #C53030 is red.600 */
						borderColor={isDragAccept ? '#2F855A' : isDragReject ? '#C53030' : 'transparent'}
						transition='border ease-in-out 0.2s'
						margin='-14px'
						marginBottom='0px'
						padding='12px'
					>
						{children}
					</Box>
					<chakra.input {...getInputProps()} />
				</chakra.div>
			)}
		</Dropzone>
	)
}

export default CloudDropzone