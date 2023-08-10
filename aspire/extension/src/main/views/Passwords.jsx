import { Grid, makeStyles, useMediaQuery } from '@material-ui/core'
import { useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

import applyPasswordSearch from 'library/common/search/applyPasswordSearch'
import applyPasswordSort from 'library/common/sort/applyPasswordSort'
import PasswordToolbar from 'library/components/PasswordToolbar'
import CenteredText from 'library/components/CenteredText'
import PasswordFab from 'library/components/PasswordFab'
import Password from 'library/components/Password'


const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(2),
		userSelect: (props) => props.isMobile && 'none'
	}
}))

function Passwords({ passwords: _passwords, searchInput, sort }) {
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))
	const classes = useStyles({ isMobile })
	const location = useLocation()
	const displayTrash = location.pathname.includes('/passwords/trash')
	const passwords = applyPasswordSort(applyPasswordSearch(Object.values(_passwords)
		.filter((e) => (e.trash ? displayTrash : !displayTrash)), searchInput), sort)

	return (<>
		<Helmet>
			<title>Passwords - Aspire</title>
		</Helmet>
		<div className={classes.root}>
			<PasswordToolbar />
			{
				Object.values(_passwords).filter((e) => !e.trash).length === 0 && !displayTrash && searchInput.length === 0
				&& (isMobile
					? <CenteredText text='You currently have no Accounts.' />
					: <CenteredText text='You currently have no Accounts.\nClick the "Create" Button in the bottom right to create one!' />)
			} {
				Object.values(_passwords).filter((e) => e.trash).length === 0 && displayTrash && searchInput.length === 0
				&& (isMobile
					? <CenteredText text='Your Trash is empty!' />
					: <CenteredText text='Your Trash is empty!\nOnce you delete accounts you will find them in here!' />)
			} {
				Object.values(passwords).length === 0 && searchInput.length > 0
				&& <CenteredText text='No search results found' />
			}
			<Grid container spacing={1}>
				{passwords.map((item) => (
					<Grid item xs={12} key={item.id}>
						<Password
							password={item}
						/>
					</Grid>
				))}
			</Grid>
			<PasswordFab />
		</div>
	</>)
}

const mapState = (state) => ({
	passwords: state.passwords,
	searchInput: state.searchInput,
	sort: state.sort.passwords
})
const mapDispatch = (dispatch) => ({})
export default connect(mapState, mapDispatch)(Passwords)