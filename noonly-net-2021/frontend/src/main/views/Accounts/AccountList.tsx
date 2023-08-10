import AccountCard, { AccountCardSkeleton } from 'library/components/AccountCard'

import { Button, Stack } from '@chakra-ui/react'
import EmptyPageMessage from 'library/components/EmptyPageMessage'
import Invisible from 'library/components/Invisible'
import useAccounts from 'library/hooks/useAccounts'
import useIsMobile from 'library/hooks/useIsMobile'
import { exportPasswordsBitwarden, exportPasswordsToJson } from 'library/utilities/exportPasswords'
import { memo } from 'react'

interface IProps {
	hasLoaded: boolean,
	trash: boolean
}

const AccountList: React.FC<IProps> = memo(({ hasLoaded, trash }) => {
	const [accounts, search] = useAccounts(trash)
	const isMobile = useIsMobile()

	return (<>
		<Button mb='3' mr='3' onClick={() => exportPasswordsToJson(accounts)}>Export to JSON</Button>
		<Button mb='3' onClick={() => exportPasswordsBitwarden(accounts)}>Export to JSON (Bitwarden Format)</Button>
		<Invisible visible={search.length > 0 && accounts.length === 0 && hasLoaded}>
			<EmptyPageMessage text='No search results found' />
		</Invisible>
		<Invisible visible={!trash && accounts.length === 0 && search.length < 1 && hasLoaded}>
			<EmptyPageMessage text='You have no Accounts' />
		</Invisible>
		<Invisible visible={!!trash && accounts.length === 0 && search.length < 1 && hasLoaded}>
			<EmptyPageMessage text='Your Trash is empty' />
		</Invisible>
		<Stack px={isMobile ? 2 : 0} pt={isMobile ? 1 : 0} mb={isMobile ? 3 : 0}>
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