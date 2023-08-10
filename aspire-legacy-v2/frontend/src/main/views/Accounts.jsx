import { Grid, makeStyles, useMediaQuery } from '@material-ui/core'
import { useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

import applyAccountSearch from 'library/common/search/applyAccountSearch'
import applyAccountSort from 'library/common/sort/applyAccountSort'
import AccountToolbar from 'library/components/AccountToolbar'
import CenteredText from 'library/components/CenteredText'
import useInitialLoad from 'library/hooks/useInitialLoad'
import AccountFab from 'library/components/AccountFab'
import Account from 'library/components/Account'

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(2),
		userSelect: (props) => props.isMobile && 'none'
	}
}))

function Accounts({ accounts: _accounts, searchInput, sort }) {
	const hasLoaded = useInitialLoad('accounts')
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))
	const classes = useStyles({ isMobile })
	const location = useLocation()
	const displayTrash = location.pathname.includes('/accounts/trash')
	const accounts = applyAccountSort(applyAccountSearch(Object.values(_accounts)
		.filter((e) => (e.trash ? displayTrash : !displayTrash)), searchInput), sort)

	return (<>
		<Helmet>
			<title>Accounts - {process.env.REACT_APP_NAME}</title>
		</Helmet>
		<div className={classes.root}>
			{
				hasLoaded
					? (<>
						<AccountToolbar />
						{
							Object.values(_accounts).filter((e) => !e.trash).length === 0 && !displayTrash && searchInput.length === 0
							&& (isMobile
								? <CenteredText text='You currently have no Accounts.' />
								: <CenteredText text='You currently have no Accounts.\nClick the "Create" Button in the bottom right to create one!' />)
						} {
							Object.values(_accounts).filter((e) => e.trash).length === 0 && displayTrash && searchInput.length === 0
							&& (isMobile
								? <CenteredText text='Your Trash is empty!' />
								: <CenteredText text='Your Trash is empty!\nOnce you delete accounts you will find them in here!' />)
						} {
							Object.values(accounts).length === 0 && searchInput.length > 0
							&& <CenteredText text='No search results found' />
						}
						<Grid container spacing={2}>
							{accounts.map((item) => (
								<Grid item xs={12} key={item.id}>
									<Account
										account={item}
									/>
								</Grid>
							))}
						</Grid>
						<AccountFab />
					</>) : (
						/* Create a nice looking loading bar here. Similar to the one in Mail */
						<div>Loading..</div>
					)
			}
		</div>
	</>)
}

const mapState = (state) => ({
	accounts: state.accounts,
	searchInput: state.searchInput,
	sort: state.sort.accounts
})
const mapDispatch = (dispatch) => ({})
export default connect(mapState, mapDispatch)(Accounts)