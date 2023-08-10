import { useCallback, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { Box } from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { InitialLoadTypes } from '@types'
import Invisible from 'library/components/Invisible'
import MailFab from './MailFab'
import MailList from './MailList'
import MailToolbar from './MailToolbar'
import PageProgress from 'library/components/PageProgress/PageProgress'
import useInitialLoad from 'library/hooks/useInitialLoad'
import useMail from 'library/hooks/useMail'

interface IProps {
	archived: boolean,
	trash: boolean,
	sent: boolean,
	match: {
		params: {
			mailId: string,
			page: string
		}
	}
}

const Mail: React.FC<IProps> = ({ archived, trash, sent, match: { params: { mailId, page: _page } } }) => {
	const page = parseInt(_page) > 0 ? parseInt(_page) : 1
	const [allMail, pageMail, allMailNotReply] = useMail(archived, trash, sent, page)
	const hasLoaded = useInitialLoad(InitialLoadTypes.MAIL)
	const location = useLocation()
	const history = useHistory()

	const setPage = useCallback((page: number) => {
		const pathname = location.pathname.split('/').slice(0, 3).join('/')
		history.push(`${pathname}/${page}`)
	}, [history, location.pathname])

	useEffect(() => {
		if (!hasLoaded) return
		if (pageMail.length === 0 && page !== 1)
			setPage(page - 1)
	}, [hasLoaded, page, pageMail.length, setPage])

	return (<>
		<Helmet>
			<title>Mail - {process.env.REACT_APP_NAME}</title>
		</Helmet>
		<PageProgress loading={!hasLoaded} />
		<MailFab trash={trash} mailId={mailId} />
		<Invisible invisible={!!mailId}>
			<MailToolbar
				pageIds={pageMail.map((mail) => mail.id)}
				paginationProps={{
					currentPage: page,
					totalCount: allMailNotReply.length / 25 || 1,
					pageSize: 1,
					onPageChange: (page: number) => setPage(page)
				}}
			/>
		</Invisible>
		<Box
			overflowY='scroll'
			overflowX='hidden'
			rounded={{ base: 'none', md: 'md' }}
			h='full'
		>
			<MailList
				hasLoaded={hasLoaded}
				allMail={allMail}
				pageMail={pageMail}
				archived={archived}
				trash={trash}
				sent={sent}
				mailId={mailId}
				page={page}
			/>
		</Box>
	</>)
}

export default Mail