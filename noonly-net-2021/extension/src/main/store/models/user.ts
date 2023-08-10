import { createModel } from '@rematch/core'
import getCookie from 'library/utilities/getCookie'
import setCookie from 'library/utilities/setCookie'
import storage from 'library/utilities/storage'
import toast from 'library/utilities/toast'
import post from 'main/axios/post'
import rfdc from 'rfdc'
import { RootModel } from '.'

const clone = rfdc()

const getSelectedAddress = (): null | string => {
	/* selected-address cookie is the id of an address */
	const selectedAddressCookie = getCookie('selected-address')
	return selectedAddressCookie || null
}

const createAddress = (username: string):string => `${username}@${process.env.REACT_APP_HOSTNAME}`

const state: Noonly.State.User = {
	selectedAddress: getSelectedAddress(),
	...storage.getItem('user')
}

const user = createModel<RootModel>()({
	state,
	reducers: {
		set: (state, payload: Noonly.State.User) => ({
			selectedAddress: state.selectedAddress || payload.addresses?.find((address) => address.address === createAddress(state.username || ''))?.id,
			...payload
		}),
		_addAddress(state, payload: Noonly.Action.UserAddAddress) {
			const clonedState = clone(state)
			clonedState.addresses?.push(payload)
			return clonedState
		},
		_removeAddress(state, payload: Noonly.Action.UserRemoveAddress) {
			const clonedState = clone(state)
			clonedState.addresses = clonedState.addresses?.filter((address) => address.id !== payload.id)
			return clonedState
		},
		_editAddressName(state, payload: Noonly.Action.UserEditAddressName) {
			const clonedState = clone(state)
			const address = clonedState.addresses?.find((address) => address.id === payload.id)
			if (address) address.name = payload.name
			return clonedState
		},
		_updateAddresses(state, payload: Noonly.Action.UserUpdateAddresses) {
			const clonedState = clone(state)
			Object.keys(payload.order).forEach((addressId) => {
				const address = clonedState.addresses?.find((e) => e.id === addressId)
				if (!address) return
				address.order = payload.order[addressId]
				address.visible = payload.visible[addressId]
			})
			return clonedState
		},
		_uploadAvatar(state, payload: Noonly.Action.UserUploadAvatar) {
			const clonedState = clone(state)
			clonedState.avatar = payload.avatar
			return clonedState
		},
		_uploadIcon(state, payload: Noonly.Action.UserUploadIcon) {
			const clonedState = clone(state)
			clonedState.icons?.push(payload.icon)
			return clonedState
		},
		_deleteIcon(state, payload: Noonly.Action.UserDeleteIcon) {
			const clonedState = clone(state)
			clonedState.icons = clonedState.icons?.filter((icon) => icon !== payload.icon)
			return clonedState
		},
		setSelectedAddress(state, payload: Noonly.Action.UserSetSelectedAddress) {
			setCookie('selected-address', payload)
			const clonedState = clone(state)
			clonedState.selectedAddress = payload
			return clonedState
		},
		/* Called from editRead, don't count mail in trash or archive */
		editUnread(state, payload: Noonly.Action.UserEditUnread) {
			const clonedState = clone(state)
			const ids = []
			/*
			 * payload.ids.forEach((id) => {
			 * 	const isInbox = payload.rootState.mail.find((mail: Noonly.API.Data.Mail) => mail.id === id)?.trash === false
			 * 		&& payload.rootState.mail.find((mail: Noonly.API.Data.Mail) => mail.id === id)?.archived === false
			 * 	if (isInbox) ids.push(id)
			 * })
			 */
			const address = clonedState.addresses?.find((address) => address.id === payload.address)
			if (address)
				address.unread = payload.read ? (address.unread || 0) - ids.length : (address.unread || 0) + ids.length
			return clonedState
		},
		/* Called from MAIL_REFRESHED, new mail will always be in inbox, so no need to check for trash or archived */
		setUnread(state, payload: Noonly.Action.UserSetUnread) {
			const clonedState = clone(state)
			Object.keys(payload).forEach((addressId) => {
				const address = clonedState.addresses?.find((address) => address.id === addressId)
				if (!address) return
				address.unread = (address.unread || 0) + payload[addressId]
			})
			return clonedState
		},
		/* Called from MAIL_INCOMING */
		setIncoming(state, payload: Noonly.Action.UserSetIncoming) {
			const clonedState = clone(state)
			const address = clonedState.addresses?.find((address) => address.id === payload.address)
			if (address) address.incoming = payload.incoming
			return clonedState
		},
		_setStatus(state, payload: Noonly.Action.UserSetStatus) {
			const clonedState = clone(state)
			clonedState.status = payload.status
			return clonedState
		}
	},
	effects: (dispatch) => ({
		addAddress({ address, name, onSuccess, onFail }: Noonly.Effect.UserAddAddress) {
			const formData: Noonly.API.Request.UserAddAddress = { address, name }
			post('/user/addAddress', formData).then((res: Noonly.API.Response.UserAddAddress) => {
				dispatch.user._addAddress(res.data.address)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		removeAddress({ id, onSuccess, onFail }: Noonly.Effect.UserRemoveAddress) {
			const formData: Noonly.API.Request.UserRemoveAddress = { id }
			post('/user/removeAddress', formData).then((res: Noonly.API.Response.UserRemoveAddress) => {
				dispatch.user._removeAddress(res.data.deleted)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		editAddressName({ id, name, onSuccess, onFail }: Noonly.Effect.UserEditAddressName) {
			const formData: Noonly.API.Request.UserEditAddressName = { id, name }
			post('/user/editAddressName', formData).then((res: Noonly.API.Response.UserEditAddressName) => {
				dispatch.user._editAddressName(res.data.updated)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		updateAddresses({ order, visible, notification = true, onSuccess, onFail }: Noonly.Effect.UserUpdateAddresses) {
			const formData: Noonly.API.Request.UserUpdateAddresses = { order, visible }
			post('/user/updateAddresses', formData).then((res: Noonly.API.Response.UserUpdateAddresses) => {
				dispatch.user._updateAddresses(res.data.updated)
				if (notification)
					toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		uploadAvatar({ image, imageName, onSuccess, onFail }: Noonly.Effect.UserUploadAvatar) {
			const formData = new FormData()
			formData.append('image', image, imageName)
			post('/user/uploadAvatar', formData).then((res: Noonly.API.Response.UserUploadAvatar) => {
				dispatch.user._uploadAvatar(res.data.updated)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		uploadIcon({ image, imageName, onSuccess, onFail }: Noonly.Effect.UserUploadIcon) {
			const formData = new FormData()
			formData.append('image', image, imageName)
			post('/user/uploadIcon', formData).then((res: Noonly.API.Response.UserUploadIcon) => {
				dispatch.user._uploadIcon(res.data.updated)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		deleteIcon({ icon, onSuccess, onFail }: Noonly.Effect.UserDeleteIcon) {
			const formData: Noonly.API.Request.UserDeleteIcon = { icon }
			post('/user/deleteIcon', formData).then((res: Noonly.API.Response.UserDeleteIcon) => {
				dispatch.user._deleteIcon(res.data.deleted)
				dispatch.accounts._deleteIcon(res.data.deleted)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		}
	})
})

export default user