import { RootState } from 'main/store/store'
import filterByQuery from 'library/utilities/filterByQuery'
import useAccountSort from './useAccountSort'
import useSearch from './useSearch'
import { useSelector } from 'react-redux'

const useAccounts = (trash: boolean): [Noonly.API.Data.Account[], string] => {
	const search = useSearch()
	const accounts = useSelector((state: RootState) => state.accounts)
	const visibleAccounts = accounts.filter((account) => (trash ? account.trash : !account.trash))
	const searchedAccounts = filterByQuery(visibleAccounts, search, ['password'])
	const sortedAccounts = useAccountSort(searchedAccounts)

	return [sortedAccounts, search]
}

export default useAccounts