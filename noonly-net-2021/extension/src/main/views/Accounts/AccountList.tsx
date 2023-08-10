import AccountCard, { AccountCardSkeleton } from 'library/components/AccountCard'

import EmptyPageMessage from 'library/components/EmptyPageMessage'
import Invisible from 'library/components/Invisible'
import { Stack } from '@chakra-ui/layout'
import { memo } from 'react'
import useAccounts from 'library/hooks/useAccounts'

interface IProps {
	hasLoaded: boolean,
	trash: boolean
}

const AccountList: React.FC<IProps> = memo(({ hasLoaded, trash }) => {
	const [accounts, search] = useAccounts(trash)

	return (<>
		<Invisible visible={search.length > 0 && accounts.length === 0 && hasLoaded}>
			<EmptyPageMessage text='No search results found' />
		</Invisible>
		<Invisible visible={!trash && accounts.length === 0 && search.length < 1 && hasLoaded}>
			<EmptyPageMessage text='You have no Accounts' />
		</Invisible>
		<Invisible visible={!!trash && accounts.length === 0 && search.length < 1 && hasLoaded}>
			<EmptyPageMessage text='Your Trash is empty' />
		</Invisible>
		<Stack>
			<Invisible invisible={hasLoaded}>
				{Array(12).fill(0).map((e, i) => (
					<AccountCardSkeleton key={i} />
				))}
			</Invisible>
			{accounts.map((account) => (
				<AccountCard account={account} key={account.id} />
			))}
		</Stack>
	</>)
})

export default AccountList