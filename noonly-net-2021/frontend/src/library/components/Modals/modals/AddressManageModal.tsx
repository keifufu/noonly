import { Box, Button, InputRightAddon, Stack } from '@chakra-ui/react'
import { Dispatch, RootState } from 'main/store/store'
import { MdAdd, MdDeleteForever, MdDragHandle, MdEdit, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { cloneElement, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import FormInput from 'library/components/FormInput'
import FormSubmitButton from 'library/components/FormSubmitButton'
import IconButton from 'library/components/IconButton'
import Modal from '../../Modal'
import { ModalProps } from '../Modals'
import Tooltip from 'library/components/Tooltip'
import getLimitsByUser from 'library/utilities/getLimitsByUser'
import { onSubmitProps } from './AlertModal'
import { useForm } from 'react-hook-form'
import useIsMobile from 'library/hooks/useIsMobile'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DnDListModule = require('react-dnd-list')
const DnDList = DnDListModule.default

const validate = {
	address: (value: string) => {
		if (!value) return 'Address is required'
		if (value.length < 4) return 'Address has to be longer than 4 characters'
		if (value.length > 40) return 'Address must be less than 40 characters'
		if (['_', '.'].includes(value[0])) return 'Address can\'t start with a special character'
		if (['_', '.'].includes(value[value.length - 1])) return 'Address can\'t end with a special character'
		if (value.match(/[^A-Za-z0-9_.]/)) return 'Address can only contain A-Z 0-9 . _'
	},
	name: (value: string) => {
		if (!value) return 'Name is required'
		if (value.length > 64) return 'Address must be less than 64 characters'
		if (value.match(/[^A-Za-z0-9]/)) return 'Name can only contain A-Z 0-9'
	}
}

interface AddAddressModalProps {
	button: JSX.Element,
	defaultValues?: {
		id: string,
		address: string,
		name: string
	}
}

const AddAddressModal: React.FC<AddAddressModalProps> = ({ button: OpenButton, defaultValues = { address: '', name: '' } }) => {
	const isEditMode = defaultValues.address.length > 0
	const [isOpen, setIsOpen] = useState(false)
	const dispatch: Dispatch = useDispatch()
	const isMobile = useIsMobile()
	const { register, handleSubmit, formState: { errors }, reset, watch, setValue, getValues } = useForm({ reValidateMode: 'onBlur', defaultValues })
	const [isSubmitting, setSubmitting] = useState(false)
	const onOpen = () => setIsOpen(true)
	const onClose = () => setIsOpen(false)

	/* Reset form after closing */
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => reset(defaultValues), [isOpen])

	useEffect(() => {
		setValue('name', getValues('address'))
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [watch('address')])

	const onSubmit = (data: any) => {
		setSubmitting(true)
		if (isEditMode) {
			if (!defaultValues.id)
				return setSubmitting(false)
			dispatch.user.editAddressName({
				id: defaultValues.id,
				name: data.name,
				onSuccess: () => {
					onClose()
					setSubmitting(false)
				},
				onFail: () => setSubmitting(false)
			})
		} else {
			dispatch.user.addAddress({
				address: data.address,
				name: data.name,
				onSuccess: () => {
					onClose()
					setSubmitting(false)
				},
				onFail: () => setSubmitting(false)
			})
		}
	}

	return (<>
		{ cloneElement(OpenButton, { onClick: onOpen }) }
		<Modal
			header={isEditMode ? 'Edit Name' : 'Add Address'}
			onClose={isSubmitting ? () => null : onClose}
			isOpen={isOpen}
			buttons={<>
				<Button disabled={isSubmitting} variant='ghost' onClick={onClose} mr='3'>Cancel</Button>
				<Button
					disabled={isSubmitting}
					isLoading={isSubmitting}
					variant='filled'
					onClick={handleSubmit(onSubmit)}
					bg='blue.600'
					_hover={{ bg: 'blue.500' }}
					_active={{ bg: 'blue.500' }}
				>
					{isEditMode ? 'Update' : 'Add'}
				</Button>
			</>}
		>
			<form>
				<Stack
					spacing='6'
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !isSubmitting) {
							e.preventDefault()
							handleSubmit(onSubmit)()
						}
					}}
				>
					<FormInput rightElement={<InputRightAddon bg='gray.600' children={`@${process.env.REACT_APP_HOSTNAME}`} />}
						autoFocus={!isMobile} isRequired label='Address' register={register} error={errors.address}
						isDisabled={isSubmitting || isEditMode} validate={validate.address} />
					<FormInput isRequired label='Name' register={register} error={errors.name} isDisabled={isSubmitting} validate={validate.name} />
				</Stack>
			</form>
		</Modal>
	</>)
}

const visible: any = {}
const Item: React.FC = (props: any) => {
	const { dnd, highlight: _highlight } = props
	const dispatch: Dispatch = useDispatch()
	const username = useSelector((state: RootState) => state.user.username)
	const isMainAddress = props.item.address.toLowerCase() === username?.toLowerCase()
	const [highlight, setHighlight] = useState(_highlight)
	const [isVisible, setIsVisible] = useState<boolean>(props.item.visible)
	visible[props.item.id] = isVisible

	return (
		<Box
			style={{ ...dnd.item.styles }}
			className={dnd.item.classes}
			ref={dnd.item.ref}
			pb={props.last ? undefined : '2'}
		>
			<Box
				h='50px'
				rounded='md'
				bg='gray.700'
				opacity={isVisible ? undefined : '0.5'}
				transition='all linear 0.1s'
				shadow='base'
				display='flex'
				alignItems='center'
				justifyContent='space-between'
				animation={highlight && 'highlight 3s infinite'}
				py='1'
				px='3'
			>
				<Box display='flex' alignItems='center'>
					<Box
						cursor='pointer'
						_active={{ cursor: 'grabbing' }}
					>
						<MdDragHandle
							size='24'
							style={{ ...dnd.handler.styles }}
							{...dnd.handler.listeners}
						/>
					</Box>
					<Box
						flex='1'
						display='flex'
						flexDir={{ base: 'column', md: 'row' }}
					>
						<Box
							ml='2'
							whiteSpace='nowrap'
							overflow='hidden'
							textOverflow='ellipsis'
						>
							{props.item.address}
						</Box>
						<Box
							ml='2'
							flexShrink={0}
							color='gray.300'
							whiteSpace='nowrap'
							overflow='hidden'
							textOverflow='ellipsis'
						>
							{`<${props.item.name}>`}
						</Box>
					</Box>
				</Box>
				<Box flexShrink={0} display='flex' alignItems='center'>
					<AddAddressModal
						defaultValues={{ id: props.item.id, address: props.item.address, name: props.item.name }}
						button={(
							<IconButton
								aria-label='Edit Name'
								tooltip='Edit Name'
								rIcon={MdEdit}
							/>
						)}
					/>
					<IconButton
						aria-label={isVisible ? 'Hide Address' : 'Show Address'}
						tooltip={isVisible ? 'Hide Address' : 'Show Address'}
						rIcon={isVisible ? MdVisibility : MdVisibilityOff}
						onClick={() => {
							if (highlight)
								setHighlight(false)
							setIsVisible(!isVisible)
						}}
					/>
					<IconButton
						aria-label='Delete Address'
						tooltip='Delete Address'
						disabled={isMainAddress}
						rIcon={MdDeleteForever}
						onClick={() => {
							dispatch.modal.open({
								id: 9,
								data: {
									header: 'Delete Address?',
									text: 'Are you sure you want to delete this Address and all its Contents? You cannot undo this action afterwards.',
									buttons: ['Cancel', 'Delete'],
									onSubmit: ({ onSuccess, onFail }: onSubmitProps) => {
										dispatch.user.removeAddress({ id: props.item.id, onSuccess, onFail })
									}
								}
							})
						}}
					/>
				</Box>
			</Box>
		</Box>
	)
}

interface IProps {
	addresses: Noonly.API.Data.UserAddress[],
	highlight?: string[]
}

let _order: any[] = []
const List: React.FC<IProps> = ({ addresses, highlight }) => {
	const [list, setList] = useState(addresses)
	_order = list

	useEffect(() => {
		setList(addresses)
	}, [addresses])

	return (
		<Box
			bg='gray.800'
			rounded='md'
			p='2'
			overflow='scroll'
			h='400px'
		>
			<DnDList
				setSwapThreshold={(size: number) => size * .75}
				setOverflowThreshold={() => 100}
				items={list}
				itemComponent={(props: any) => <Item highlight={highlight?.includes(props.item.id)} {...props} />}
				setList={setList}
			/>
		</Box>
	)
}

const AddressManageModal: React.FC<ModalProps> = ({ modal }) => {
	const unsortedAddresses = useSelector((state: RootState) => state.user.addresses)
	const addresses = unsortedAddresses?.sort((a, b) => a.order - b.order)
	const { highlight }: { highlight: string[] } = modal.data
	const dispatch: Dispatch = useDispatch()
	const user = useSelector((state: RootState) => state.user)
	const hasReachedAddressLimit = (addresses?.length || 0) + 1 > getLimitsByUser(user as Noonly.API.Data.User).addresses
	const [isSubmitting, setSubmitting] = useState(false)

	const onSubmit = () => {
		setSubmitting(true)
		const order: any = {}
		for (let i = 0; i < _order.length; i++)
			order[_order[i].id] = i
		dispatch.user.updateAddresses({
			order: order,
			visible: visible,
			onSuccess: () => {
				setSubmitting(false)
				modal.onClose()
			},
			onFail: () => setSubmitting(false)
		})
	}

	return (
		<Modal
			disabled={isSubmitting}
			header='Manage Addresses'
			onClose={isSubmitting ? () => null : modal.onClose}
			isOpen={modal.open}
			size='2xl'
			buttons={<>
				<AddAddressModal button={(
					<Box mr='auto'>
						<Tooltip label={hasReachedAddressLimit && 'Reached maximum Address limit'} shouldWrapChildren>
							<Button
								disabled={isSubmitting || hasReachedAddressLimit}
								variant='filled'
								bg='blue.600'
								_hover={{ bg: 'blue.500' }}
								_active={{ bg: 'blue.500' }}
							>
								<MdAdd size='20' />
								<Box ml='2'>
									Add
								</Box>
							</Button>
						</Tooltip>
					</Box>
				)} />
				<Button disabled={isSubmitting} variant='ghost' onClick={modal.onClose} mr='3'>Cancel</Button>
				<FormSubmitButton onClick={onSubmit} isDisabled={isSubmitting} isLoading={isSubmitting}>Save</FormSubmitButton>
			</>}
		>
			<Box cursor={isSubmitting ? 'not-allowed' : undefined}>
				<Box
					pointerEvents={isSubmitting ? 'none' : undefined}
					userSelect={isSubmitting ? 'none' : undefined}
				>
					<List addresses={addresses || []} highlight={highlight} />
				</Box>
			</Box>
		</Modal>
	)
}

export default AddressManageModal