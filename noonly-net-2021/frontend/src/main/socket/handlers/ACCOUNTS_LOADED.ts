import { InitialLoadTypes } from '@types'
import { Socket } from 'socket.io-client'
import store from 'main/store'

interface AccountsLoadedData {
	accounts: Noonly.State.Accounts
}

export default (socket: Socket): Socket => socket.on('ACCOUNTS_LOADED', (data: AccountsLoadedData) => {
	store.dispatch.initialLoad.set({ type: InitialLoadTypes.ACCOUNTS, value: true })
	store.dispatch.accounts.set(data.accounts)
})