import { RematchDispatch, RematchRootState, init } from '@rematch/core'
import { RootModel, models } from './models'

import devBuild from 'library/utilities/devBuild'
import post from 'main/axios/post'
import storage from 'library/utilities/storage'
import toast from 'library/utilities/toast'

const store = init({
	redux: {
		devtoolOptions: { disabled: !devBuild }
	},
	models
})

export const updateData = (cb?: () => void): void => {
	if (storage.jwtToken) {
		/* Fetch Accounts */
		post('/accounts/fetch', {}, { timeout: 3000 }).then((res) => {
			storage.setItem('accounts', Object.values(res.data.accounts))
			store.dispatch.accounts.set(res.data.accounts)
		}).catch((error) => {
			if (error.message === 'Access Denied')
				return storage.logout()
			toast.showError('Failed to update Accounts')
		})

		/* Fetch User */
		post('/user/fetch', {}, { timeout: 3000 }).then((res) => {
			storage.setItem('user', res.data.user)
			store.dispatch.user.set(res.data.user)
			if (typeof cb === 'function') cb()
		}).catch((error) => {
			if (error.message === 'Access Denied')
				return storage.logout()
			toast.showError('Failed to update User')
		})
	}
}
updateData()

export default store
export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>