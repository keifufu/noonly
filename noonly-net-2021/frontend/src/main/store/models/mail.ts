import { RootModel } from '.'
import { createModel } from '@rematch/core'
import post from 'main/axios/post'
import socket from 'main/socket'
import store from '../store'
import toast from 'library/utilities/toast'

const state: Noonly.State.Mail = []
const mail = createModel<RootModel>()({
	state,
	reducers: {
		set: (state, payload: Noonly.State.Mail) => Object.values(payload),
		add: (state, payload: Noonly.State.Mail) => ([...state, ...payload]),
		_delete(state, payload: Noonly.Action.MailDelete) {
			return state.filter((mail) => !payload.ids.includes(mail.id))
		},
		_editRead(state, payload: Noonly.Action.MailEditRead) {
			return state.map((mail) => {
				if (payload.ids.includes(mail.id))
					return { ...mail, read: payload.read }
				return mail
			})
		},
		_editTrash(state, payload: Noonly.Action.MailEditTrash) {
			return state.map((mail) => {
				if (payload.ids.includes(mail.id))
					return { ...mail, trash: payload.trash }
				return mail
			})
		},
		_editArchived(state, payload: Noonly.Action.MailEditArchived) {
			return state.map((mail) => {
				if (payload.ids.includes(mail.id))
					return { ...mail, archived: payload.archived }
				return mail
			})
		},
		_fetchContent(state, payload: Noonly.Action.MailFetchContent) {
			return state.map((mail) => (mail.id === payload.id ? { ...mail, ...payload } : mail))
		}
	},
	effects: (dispatch) => ({
		refresh(payload: Noonly.Effect.MailRefresh, rootState) {
			const loadedIds = Object.values(rootState.mail).map((e) => e.id)
			socket.emit('REFRESH_MAIL', { loadedIds })
		},
		delete({ ids, onSuccess, onFail }: Noonly.Effect.MailDelete) {
			const formData: Noonly.API.Request.MailDelete = { ids }
			post('/mail/delete', formData).then((res: Noonly.API.Response.MailDelete) => {
				dispatch.mail._delete(res.data.deleted)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		clearTrash({ onSuccess, onFail }: Noonly.Effect.MailClearTrash, rootState) {
			const { selectedAddress } = rootState.user
			if (!selectedAddress) return
			const formData: Noonly.API.Request.MailClearTrash = { addressId: selectedAddress }
			post('/mail/clearTrash', formData).then((res: Noonly.API.Response.MailClearTrash) => {
				dispatch.mail._delete(res.data.deleted)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		editRead({ ids, read, notification = true, _redo }: Noonly.Effect.MailEditRead, rootState) {
			/* This is actually needed, otherwise unread state will get messed up */
			const unreadIds = ids.filter((id: string) => rootState.mail.find((mail) => mail.id === id)?.read !== read)
			if (unreadIds.length === 0)
				return toast.show(`Marked as ${read ? 'read' : 'unread'}`)

			/* Update store before making the request */
			const predictedResponse = { ids: unreadIds, read }
			dispatch.mail._editRead(predictedResponse)
			const predictedAddressId = rootState.mail.find((mail) => mail.id === predictedResponse.ids[0])?.sentToAddressId
			if (predictedAddressId)
				store.dispatch.user.editUnread({ address: predictedAddressId, ids, read, rootState })

			if (notification) {
				toast.show({
					id: `mailEditRead${ids[0]}`,
					description: read
						? 'Marked Mail as read'
						: 'Marked Mail as unread',
					action: _redo ? 'Redo' : 'Undo',
					onClick: () => dispatch.mail.editRead({ ids, read: !read, notification, _redo: !_redo })
				})
			}

			const formData: Noonly.API.Request.MailEditRead = { ids: unreadIds, read }
			post('/mail/editRead', formData).then((res: Noonly.API.Response.MailEditRead) => {
				// Hmmm..
			}).catch((error) => {
				toast.showError(error.message)
			})
		},
		editTrash({ ids, trash, _redo }: Noonly.Effect.MailEditTrash, rootState) {
			/* Update store before making the request */
			const predictedResponse = { ids, trash }
			dispatch.mail._editTrash(predictedResponse)

			const unreadMail = ids.filter((id) => !rootState.mail.find((mail) => mail.id === id)?.read)
			const addressId = rootState.mail.find((mail) => mail.id === ids[0])?.sentToAddressId
			if (addressId)
				store.dispatch.user.setUnread({ [addressId]: predictedResponse.trash ? -unreadMail.length : unreadMail.length })

			toast.show({
				id: `mailEditTrash${ids[0]}`,
				description: trash
					? 'Moved Mail to Trash'
					: 'Restored Mail',
				action: _redo ? 'Redo' : 'Undo',
				onClick: () => dispatch.mail.editTrash({ ids, trash: !trash, _redo: !_redo })
			})

			const formData: Noonly.API.Request.MailEditTrash = { ids, trash }
			post('/mail/editTrash', formData).then((res: Noonly.API.Response.MailEditTrash) => {
				// Hmmm..
			}).catch((error) => {
				toast.showError(error.message)
			})
		},
		editArchived({ ids, archived, _redo }: Noonly.Effect.MailEditArchived, rootState) {
			/* Update store before making the request */
			const predictedResponse = { ids, archived }
			dispatch.mail._editArchived(predictedResponse)

			const unreadMail = ids.filter((id) => !rootState.mail.find((mail) => mail.id === id)?.read)
			const addressId = rootState.mail.find((mail) => mail.id === ids[0])?.sentToAddressId
			if (addressId)
				store.dispatch.user.setUnread({ [addressId]: predictedResponse.archived ? -unreadMail.length : unreadMail.length })

			toast.show({
				id: `mailEditArchived${ids[0]}`,
				description: archived
					? 'Archived Mail'
					: 'Unarchived Mail',
				action: _redo ? 'Redo' : 'Undo',
				onClick: () => dispatch.mail.editArchived({ ids, archived: !archived, _redo: !_redo })
			})

			const formData: Noonly.API.Request.MailEditArchived = { ids, archived }
			post('/mail/editArchived', formData).then((res: Noonly.API.Response.MailEditArchived) => {
				// Hmmm..
			}).catch((error) => {
				toast.showError(error.message)
			})
		}
	})
})

export default mail