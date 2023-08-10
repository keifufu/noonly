import { Box, Button, Slider, SliderFilledTrack, SliderThumb, SliderTrack, chakra } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

import AvatarEditor from 'react-avatar-editor'
import { Dispatch } from 'main/store/store'
import Dropzone from 'react-dropzone'
import FormSubmitButton from 'library/components/FormSubmitButton'
import { GoArrowBoth } from 'react-icons/go'
import { MdImage } from 'react-icons/md'
import Modal from '../../Modal'
import { ModalProps } from '../Modals'
import toast from 'library/utilities/toast'
import { useDispatch } from 'react-redux'
import useIsMobile from 'library/hooks/useIsMobile'

interface ImageType {
	size: number,
	type: string,
	name: string,
	base64?: string,
	file?: File
}

const ImageUploadModal: React.FC<ModalProps> = ({ modal }) => {
	const editorRef = useRef<null | AvatarEditor>(null)
	const [scale, setScale] = useState(1)
	const [image, setImage] = useState<null | ImageType>(null)
	const dispatch: Dispatch = useDispatch()
	const { type } = modal.data
	const header = type === 'AVATAR' ? 'Upload Avatar' : type === 'ICON' ? 'Upload Icon' : 'Upload Image'
	const isMobile = useIsMobile()
	const [isSubmitting, setSubmitting] = useState(false)

	/* Reset after closing */
	useEffect(() => {
		setScale(1)
		setImage(null)
	}, [modal.open, setScale, setImage])

	const handleDrop = (dropped: File[]) => {
		const [image] = dropped
		if (['image/gif'].includes(image.type)) {
			const reader = new FileReader()
			reader.addEventListener('load', (e) => {
				setScale(1)
				setImage({
					size: image.size,
					type: image.type,
					name: image.name,
					base64: (e.target?.result?.toString() || '')
				})
			})
			reader.readAsDataURL(image)
			return
		}
		setScale(1)
		setImage({
			size: dropped[0].size,
			type: dropped[0].type,
			name: dropped[0].name,
			file: dropped[0]
		})
	}

	const dispatchUpload = (blob: Blob) => {
		if (!image) return
		if (type === 'AVATAR') {
			dispatch.user.uploadAvatar({
				image: blob,
				imageName: image.name,
				onSuccess: () => {
					modal.onClose()
					setSubmitting(false)
				},
				onFail: () => setSubmitting(false)
			})
		} else if (type === 'ICON') {
			dispatch.user.uploadIcon({
				image: blob,
				imageName: image.name,
				onSuccess: () => {
					modal.onClose()
					setSubmitting(false)
				},
				onFail: () => setSubmitting(false)
			})
		}
	}

	const onSubmit = () => {
		setSubmitting(true)
		if (image?.base64) {
			fetch(image.base64).then((res) => res.blob()).then((blob) => {
				dispatchUpload(blob)
			})
		} else {
			const canvas = editorRef.current?.getImageScaledToCanvas()
			if (!canvas) return
			canvas.toBlob((blob) => {
				blob && dispatchUpload(blob)
			})
		}
	}

	return (
		<Modal
			disabled={isSubmitting}
			header={header}
			onClose={isSubmitting ? () => null : modal.onClose}
			isOpen={modal.open}
			size='md'
			buttons={<>
				<Button disabled={isSubmitting} variant='ghost' onClick={modal.onClose} mr='3'>Cancel</Button>
				<FormSubmitButton onClick={onSubmit} isDisabled={isSubmitting || image === null} isLoading={isSubmitting}>Upload</FormSubmitButton>
			</>}
		>
			<Dropzone
				onDropAccepted={handleDrop}
				onDropRejected={(e) => {
					if (e[0].errors[0].code === 'too-many-files')
						toast.showError('You can only upload one file')
					if (e[0].errors[0].code === 'file-too-large')
						toast.showError('The provided file is too large (>3MB)')
					if (e[0].errors[0].code === 'file-invalid-type')
						toast.showError('Invalid file type')
				}}
				noClick
				noKeyboard
				maxSize={3000000}
				multiple={false}
				accept={['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg', 'image/tiff']}
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				style={{ width: '250px', height: '250px' }}
			>
				{({ getRootProps, getInputProps, isDragAccept, isDragReject, open }) => (
					<chakra.div {...getRootProps()}>
						<Box
							bg='gray.800'
							rounded='md'
							p='0'
							display='flex'
							alignItems='center'
							justifyContent='center'
						>
							{image ? ['image/gif'].includes(image.type) ? (
								<chakra.img
									src={image.base64}
									rounded='60'
									w='250px'
									h='250px'
								/>
							) : (
								<AvatarEditor
									/* #2D3748 is gray.700 */
									style={{ backgroundColor: '#2D3748' }}
									image={image.file || ''}
									borderRadius={60}
									ref={editorRef}
									width={250}
									height={250}
									border={0}
									color={[0, 0, 0, 0.6]}
									scale={scale}
									rotate={0}
								/>
							) : (
								<Box
									h='250px'
									w='full'
									border='6px dashed'
									/* #38A169 is green.500 */
									/* #C53030 is red.600 */
									/* #2c5282 is blue.700 */
									borderColor={isDragAccept ? '#38A169' : isDragReject ? '#C53030' : '#2c5282'}
									transition='all linear 0.2s'
									rounded='md'
									cursor='pointer'
									onClick={() => open()}
									display='flex'
									alignItems='center'
									justifyContent='center'
									fontSize='xl'
									pb='2'
								>
									{isMobile ? 'Click to select a File' : 'Drag or click to upload'}
								</Box>
							)}
						</Box>
						<chakra.input {...getInputProps()} />
					</chakra.div>
				)}
			</Dropzone>
			<Box
				pt='6'
				display='flex'
				alignItems='center'
			>
				<MdImage size='26' />
				<Slider
					mx='3'
					focusThumbOnChange={false}
					value={scale * 100}
					min={100}
					max={300}
					onChange={(val) => setScale(val / 100)}
					disabled={['image/gif'].includes(image?.type || '') || !image}
				>
					<SliderTrack bg='gray.600' height='2' rounded='md'>
						<SliderFilledTrack bg='blue.600' />
					</SliderTrack>
					<SliderThumb bg='gray.800' boxSize={6}>
						<Box color='blue.600' size='20' as={GoArrowBoth} />
					</SliderThumb>
				</Slider>
				<MdImage size='40' />
			</Box>
		</Modal>
	)
}

export default ImageUploadModal