import AccountList from './AccountList'
import AccountsFab from './AccountsFab'
import { Box } from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { InitialLoadTypes } from '@types'
import PageProgress from 'library/components/PageProgress'
import { memo } from 'react'
import useInitialLoad from 'library/hooks/useInitialLoad'

interface IProps {
	trash: boolean
}

const Accounts: React.FC<IProps> = memo(({ trash }) => {
	const hasLoaded = useInitialLoad(InitialLoadTypes.ACCOUNTS)

	return (<>
		<Helmet>
			<title>Accounts - {process.env.REACT_APP_NAME}</title>
		</Helmet>
		<PageProgress loading={!hasLoaded} />
		<AccountsFab trash={trash} />
		<Box
			overflowY='scroll'
			overflowX='hidden'
			rounded='md'
			h='full'
		>
			<AccountList hasLoaded={hasLoaded} trash={trash} />
		</Box>
	</>)
})

export default Accounts