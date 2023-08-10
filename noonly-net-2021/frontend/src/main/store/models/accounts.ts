import { createModel } from '@rematch/core'
import encrypt from 'library/utilities/encrypt'
import toast from 'library/utilities/toast'
import post from 'main/axios/post'
import { RootModel } from '.'

const state: Noonly.State.Accounts = []
const accounts = createModel<RootModel>()({
	state,
	reducers: {
		set: (state, payload: Noonly.State.Accounts) => Object.values(payload),
		_create(state, payload: Noonly.Action.AccountCreate) {
			const index = state.findIndex((account) => account.id === payload.id)
			if (index === -1)
				return [...state, payload]
			else
				return [...state.slice(0, index), payload, ...state.slice(index + 1)]
		},
		_delete(state, payload: Noonly.Action.AccountDelete) {
			return state.filter((account) => (payload.ids ? !payload.ids.includes(account.id) : account.id !== payload.id))
		},
		_editTrash(state, payload: Noonly.Action.AccountEditTrash) {
			return state.map((account) => {
				if (account.id === payload.id)
					return { ...account, trash: payload.trash }
				return account
			})
		},
		_editNote(state, payload: Noonly.Action.AccountEditNote) {
			return state.map((account) => {
				if (account.id === payload.id)
					return { ...account, note: payload.note }
				return account
			})
		},
		_editIcon(state, payload: Noonly.Action.AccountEditIcon) {
			return state.map((account) => {
				if (account.id === payload.id)
					return { ...account, icon: payload.icon }
				return account
			})
		},
		_deleteIcon(state, payload: Noonly.Action.AccountDeleteIcon) {
			return state.map((account) => (account.icon === payload.icon ? { ...account, icon: null } : account))
		},
		_setMfaSecret(state, payload: Noonly.Action.AccountSetMfaSecret) {
			return state.map((account) => {
				if (account.id === payload.id)
					return { ...account, mfaSecret: payload.mfaSecret }
				return account
			})
		}
	},
	effects: (dispatch) => ({
		create({ site, username, address, password, onSuccess, onFail }: Noonly.Effect.AccountCreate) {
			const formData: Noonly.API.Request.AccountCreate = { site, username, address, password }
			post('/accounts/create', formData).then((res: Noonly.API.Response.AccountCreate) => {
				dispatch.accounts._create(res.data.account)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		edit({ id, site, username, address, password, onSuccess, onFail }: Noonly.Effect.AccountEdit) {
			const formData: Noonly.API.Request.AccountEdit = { id, site, username, address, password }
			post('/accounts/edit', formData).then((res: Noonly.API.Response.AccountEdit) => {
				dispatch.accounts._create(res.data.account)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		delete({ id, onSuccess, onFail }: Noonly.Effect.AccountDelete) {
			const formData: Noonly.API.Request.AccountDelete = { id }
			post('/accounts/delete', formData).then((res: Noonly.API.Response.AccountDelete) => {
				dispatch.accounts._delete(res.data.deleted)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		clearTrash({ onSuccess, onFail }: Noonly.Effect.AccountClearTrash) {
			post('/accounts/clearTrash').then((res: Noonly.API.Response.AccountClearTrash) => {
				dispatch.accounts._delete(res.data.deleted)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		editTrash({ id, trash, _redo }: Noonly.Effect.AccountEditTrash) {
			/* Update store before making the request */
			const predictedResponse = { id, trash }
			dispatch.accounts._editTrash(predictedResponse)

			toast.show({
				id: `accountEditTrash${id}`,
				description: trash
					? 'Moved Account to Trash'
					: 'Restored Account',
				action: _redo ? 'Redo' : 'Undo',
				onClick: () => dispatch.accounts.editTrash({ id, trash: !trash, _redo: !_redo })
			})

			const formData: Noonly.API.Request.AccountEditTrash = { id, trash }
			post('/accounts/editTrash', formData).then((res: Noonly.API.Response.AccountEditTrash) => {
				// Hmmm..
			}).catch((error) => {
				toast.showError(error.message)
			})
		},
		editNote({ id, note, onSuccess }: Noonly.Effect.AccountEditNote) {
			const formData: Noonly.API.Request.AccountEditNote = { id, note: encrypt(note) }
			post('/accounts/editNote', formData).then((res: Noonly.API.Response.AccountEditNote) => {
				dispatch.accounts._editNote(res.data.updated)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
			})
		},
		editIcon({ id, icon, onSuccess, onFail }: Noonly.Effect.AccountEditIcon) {
			const formData: Noonly.API.Request.AccountEditIcon = { id, icon }
			post('/accounts/editIcon', formData).then((res: Noonly.API.Response.AccountEditIcon) => {
				dispatch.accounts._editIcon(res.data.updated)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		setMfaSecret({ id, mfaSecret, onSuccess, onFail }: Noonly.Effect.AccountSetMfaSecret) {
			const formData: Noonly.API.Request.AccountSetMfaSecret = { id, mfaSecret }
			post('/accounts/setMfaSecret', formData).then((res: Noonly.API.Response.AccountSetMfaSecret) => {
				dispatch.accounts._setMfaSecret(res.data.updated)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		}
	})
})

export default accounts