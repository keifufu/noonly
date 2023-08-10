import { RootState } from 'main/store/store'
import filterByQuery from 'library/utilities/filterByQuery'
import useAccountSort from './useAccountSort'
import { useMemo } from 'react'
import useSearch from './useSearch'
import { useSelector } from 'react-redux'

const useAccounts = (trash: boolean): [Noonly.API.Data.Account[], string] => {
	const search = useSearch()
	const accounts = useSelector((state: RootState) => state.accounts)
	const visibleAccounts = useMemo(() => accounts.filter((account) => (trash ? account.trash : !account.trash)), [accounts, trash])
	const searchedAccounts = useMemo(() => filterByQuery(visibleAccounts, search, ['password']), [visibleAccounts, search])
	const sortedAccounts = useAccountSort(searchedAccounts)

	return [sortedAccounts, search]
}

export default useAccounts