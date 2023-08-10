import { Box, Button, Img, Skeleton } from '@chakra-ui/react'
import { Dispatch, RootState } from 'main/store/store'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'

import FormSubmitButton from 'library/components/FormSubmitButton'
import Grid from '@bit/mui-org.material-ui.grid'
import Invisible from 'library/components/Invisible'
import { MdFileUpload } from 'react-icons/md'
import Modal from '../../Modal'
import { ModalProps } from '../Modals'
import Tooltip from 'library/components/Tooltip'
import getLimitsByUser from 'library/utilities/getLimitsByUser'
import imgHost from 'library/utilities/imgHost'
import { useForm } from 'react-hook-form'

interface IProps {
	icon: string,
	isSelected: boolean,
	setSelected: () => void,
	setUnselected: () => void
}

const AccountIcon: React.FC<IProps> = ({ icon, isSelected, setSelected, setUnselected }) => {
	const [imageLoaded, setImageLoaded] = useState(false)
	const [imgHeight, setImageHeight] = useState(0)
	const dispatch: Dispatch = useDispatch()
	const imgRef = useRef<HTMLImageElement | null>(null)

	useEffect(() => {
		const width = imgRef.current?.width ?? 0
		if (width !== 0)
			setImageHeight(width)
	}, [imgRef])

	return (
		<Box
			p='1'
			bg={isSelected ? 'blue.600' : 'gray.600'}
			transform={isSelected ? 'scale(1.04)' : undefined}
			transition='all linear 0.1s'
			rounded='xl'
			cursor='pointer'
			onClick={isSelected ? setUnselected : setSelected}
			onContextMenu={(e) => dispatch.contextMenu.open({ id: 4, e, data: { icon } })}
		>
			<Skeleton style={{ aspectRatio: '1/1' }} w='full' rounded='xl' isLoaded={imageLoaded}>
				<Box display={imageLoaded ? 'none' : 'block'}>
					Hello there,
					this is some amazing placeholder text.
					I could not think of a better way to do this.
					Please forgive me.

					Thanks,
					keifufu
				</Box>
				<Img
					ref={imgRef}
					onLoad={() => setImageLoaded(true)}
					height={imgHeight === 0 ? undefined : imgHeight}
					width='full'
					pointerEvents='none'
					objectFit='cover'
					userSelect='none'
					rounded='xl'
					src={`${imgHost}/icon/${icon}`}
				/>
			</Skeleton>
		</Box>
	)
}

let lastIconLength = 0
const AccountIconPickerModal: React.FC<ModalProps> = ({ modal }) => {
	const user = useSelector((state: RootState) => state.user)
	const dispatch: Dispatch = useDispatch()
	const account = modal.data
	const defaultValues = { selected: account.icon || '' }
	const { setValue, getValues, handleSubmit, watch, reset } = useForm({ reValidateMode: 'onBlur', defaultValues })
	const [isSubmitting, setSubmitting] = useState(false)
	const icons = [...(user.icons || [])].reverse()
	const hasReachedIconLimit = icons.length + 1 > getLimitsByUser(user as Noonly.API.Data.User).icons
	/* Without watching, it doesn't seem to update :shrug: */
	watch('selected')

	/* Reset form after closing */
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => reset(defaultValues), [modal.open, reset])

	useEffect(() => {
		lastIconLength = icons.length
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (lastIconLength < icons.length)
			setValue('selected', icons[0])
		lastIconLength = icons.length

		const selectedIcon = getValues('selected')
		if (selectedIcon !== null && !icons.includes(selectedIcon))
			setValue('selected', null)
	}, [getValues, icons, setValue])

	const onSubmit = (data: any) => {
		setSubmitting(true)
		dispatch.accounts.editIcon({
			id: account.id,
			icon: data.selected === '' ? null : data.selected,
			onSuccess: () => {
				modal.onClose()
				setSubmitting(false)
			},
			onFail: () => setSubmitting(false)
		})
	}

	return (
		<Modal
			disabled={isSubmitting}
			header='Select Icon'
			onClose={isSubmitting ? () => null : modal.onClose}
			isOpen={modal.open}
			size='2xl'
			buttons={<>
				<Box mr='auto'>
					<Tooltip label={hasReachedIconLimit && 'Reached maximum Icon limit'} shouldWrapChildren>
						<Button
							onClick={() => dispatch.modal.open({ id: 5, data: { type: 'ICON' } })}
							disabled={isSubmitting || hasReachedIconLimit}
							variant='filled'
							bg='blue.600'
							_hover={{ bg: 'blue.500' }}
							_active={{ bg: 'blue.500' }}
						>
							<MdFileUpload size='20' />
							<Box ml='2'>
								Upload
							</Box>
						</Button>
					</Tooltip>
				</Box>
				<Button disabled={isSubmitting} variant='ghost' onClick={modal.onClose} mr='3'>Cancel</Button>
				<FormSubmitButton onClick={handleSubmit(onSubmit)} disabled={isSubmitting} isLoading={isSubmitting}>Update</FormSubmitButton>
			</>}
		>
			<Invisible invisible={(user.icons?.length || 0) > 0}>
				<Box
					bg='gray.800'
					rounded='md'
					height='300px'
					width='full'
					display='flex'
					alignItems='center'
					justifyContent='center'
					fontSize='x-large'
				>
					No Icons found
				</Box>
			</Invisible>
			<Invisible invisible={(user.icons?.length || 0) === 0}>
				<Box
					bg='gray.800'
					rounded='md'
					height='300px'
					width='full'
					p='2'
					overflow='scroll'
				>
					<Grid container spacing={1}>
						{icons.map((icon) => (
							<Grid item xs={3} md={2} key={icon}>
								<AccountIcon
									setUnselected={() => setValue('selected', '')}
									setSelected={() => setValue('selected', icon)}
									isSelected={getValues('selected') === icon}
									icon={icon}
								/>
							</Grid>
						))}
					</Grid>
				</Box>
			</Invisible>
		</Modal>
	)
}

export default AccountIconPickerModal