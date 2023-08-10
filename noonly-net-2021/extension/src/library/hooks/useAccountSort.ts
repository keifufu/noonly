import { RootState } from 'main/store/store'
import { useSelector } from 'react-redux'

const useAccountSort = (accounts: Noonly.API.Data.Account[]): Noonly.API.Data.Account[] => {
	const sort = useSelector((state: RootState) => state.sort.accounts)
	let sortedAccounts: Noonly.API.Data.Account[] = []

	if (sort.method === 'Name') {
		if (sort.direction === 'down')
			sortedAccounts = accounts.sort((a, b) => (a.site.toLowerCase() < b.site.toLowerCase() ? -1 : a.site.toLowerCase() > b.site.toLowerCase() ? 1 : 0))
		else if (sort.direction === 'up')
			sortedAccounts = accounts.sort((a, b) => (a.site.toLowerCase() > b.site.toLowerCase() ? -1 : a.site.toLowerCase() < b.site.toLowerCase() ? 1 : 0))
	} else if (sort.method === 'Last Modified') {
		if (sort.direction === 'down')
			sortedAccounts = accounts.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
		else if (sort.direction === 'up')
			sortedAccounts = accounts.sort((a, b) => Date.parse(a.updatedAt) - Date.parse(b.updatedAt))
	} else if (sort.method === 'Creation Date') {
		if (sort.direction === 'down')
			sortedAccounts = accounts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
		else if (sort.direction === 'up')
			sortedAccounts = accounts.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
	}

	return sortedAccounts
}

export default useAccountSort