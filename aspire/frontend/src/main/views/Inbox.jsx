import { BottomNavigation, BottomNavigationAction, Grid, Hidden, makeStyles, useMediaQuery } from '@material-ui/core'
import { Inbox as MUIInbox, Archive, Delete, Favorite } from '@material-ui/icons'
import { useHistory, useLocation } from 'react-router-dom'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Pagination } from '@material-ui/lab'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

import InboxFab from 'library/components/InboxFab/InboxFab'
import CenteredText from 'library/components/CenteredText'
import MailToolbar from 'library/components/MailToolbar'
import MailPreview from 'library/components/MailPreview'
import Invisible from 'library/components/Invisible'
import Mail from 'library/components/Mail'

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(2),
		display: 'flex',
		flexDirection: 'column',
		overflow: 'scroll'
	},
	grid: {
		overflowY: 'scroll'
	},
	pagination: {
		marginTop: theme.spacing(1),
		alignSelf: 'center'
	},
	stickToBottom: {
		position: 'fixed',
		zIndex: 99999,
		width: '100%',
		bottom: 0
	},
	bottomNavigationSpacer: {
		height: 50
	}
}))

function Inbox({ mail: _mail, searchInput, sort, selection, setSelection }) {
	const classes = useStyles()
	const history = useHistory()
	const location = useLocation()
	const [page, setPage] = useState(1)
	const displayTrash = location.pathname.includes('/inbox/trash')
	const displayArchived = location.pathname.includes('/inbox/archived')
	const displayFavorite = location.pathname.includes('/inbox/favorite')
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))
	const gridRef = useRef()
	const mail = Object.values(_mail[_mail.selected])
		.sort((a, b) => b.date - a.date)
		.filter((e) => (e.trash ? displayTrash : !displayTrash))
		.filter((e) => (e.archived ? displayArchived : !displayArchived))
		.filter((e) => (e.favorite ? true : !displayFavorite))
	const arr = location.pathname.split('/inbox/')
	const viewing = arr.length > 0 && Object.values(_mail[_mail.selected]).find((e) => e.id === arr[1])
	const unread = mail.filter((e) => !e.isread).length
	const tabValue = displayArchived ? 1 : displayFavorite ? 2 : displayTrash ? 3 : 0

	useEffect(() => {
		setSelection([])
	}, [setSelection])

	const onTabChange = (e, value) => {
		const location = value === 0 ? 'inbox' : value === 1 ? 'archived' : value === 2 ? 'favorite' : 'trash'
		history.push(`/inbox/${location}`)
		setSelection([])
		setPage(1)
	}

	const mapReplies = (item) => item.replies.map((item) => {
		const gridItem = <Grid
			item
			xs={12}
			key={item.id}
		>
			<Mail
				mail={item}
				isResponse={true}
			/>
		</Grid>
		if (item.replies) {
			/**
			 * Dont replace Fragment with a div, it will break the styling for some Reason
			 * Also, the Reason we use React.Fragement instead of <> here is that we need to give it a key
			 */
			return (<Fragment key={item.id}>
				{gridItem}
				{mapReplies(item)}
			</Fragment>)
		} else {
			return gridItem
		}
	})

	if (viewing) {
		return (<>
			<Helmet>
				<title>{viewing.subject || '(no subject)'} - Aspire</title>
			</Helmet>
			<div className={classes.root}>
				<Grid container spacing={1} className={classes.viewingGridContainer}>
					<Grid item xs={12} key={viewing.id}>
						<Mail
							mail={viewing}
							first={true}
						/>
					</Grid>
					{viewing.replies && mapReplies(viewing)}
				</Grid>
			</div>
		</>)
	} else {
		return (<>
			<Helmet>
				<title>Inbox{unread ? ` (${unread})` : ''} - Aspire</title>
			</Helmet>
			<div className={classes.root}>
				<MailToolbar page={page} setPage={setPage} />
				{
					Object.values(mail).length === 0 && !displayTrash && !displayArchived && !displayFavorite && searchInput.length === 0
					&& <CenteredText text='You currently have no new Mail.' />
				} {
					Object.values(mail).length === 0 && displayTrash && !displayArchived && !displayFavorite && searchInput.length === 0
					&& (isMobile
						? <CenteredText text='Your Trash is empty!' />
						: <CenteredText text='Your Trash is empty!\nOnce you delete your Mail you will find it in here!' />)
				} {
					Object.values(mail).length === 0 && displayArchived && !displayTrash && !displayFavorite && searchInput.length === 0
					&& (isMobile
						? <CenteredText text='You have no archived Mail.' />
						: <CenteredText text='You have no archived Mail.\nOnce you archive some you will find it in here!' />)
				} {
					Object.values(mail).length === 0 && displayFavorite && !displayArchived && !displayTrash && searchInput.length === 0
					&& (isMobile
						? <CenteredText text='You have no favorite Mail.' />
						: <CenteredText text='You have no favorite Mail.\nOnce you favorite some you will find it in here!' />)
				} {
					Object.values(mail).length === 0 && searchInput.length > 0
					&& <CenteredText text='No search results found' />
				}
				<Grid container spacing={1} className={classes.grid} ref={gridRef}>
					{mail.slice((page - 1) * 25, page * 25).map((item) => (
						<Grid item xs={12} key={item.id}>
							<MailPreview
								mail={item}
								selected={selection.includes(item.id)}
							/>
						</Grid>
					))}
				</Grid>
				<Invisible
					className={classes.pagination}
					invisible={(Math.ceil(mail.length / 25)) < 2}
				>
					<Pagination
						count={Math.ceil(mail.length / 25)}
						page={page}
						color='primary'
						onChange={(e, value) => {
							if (page === value) return
							gridRef.current.scrollTop = 0
							setPage(value)
							setSelection([])
						}}
					/>
				</Invisible>
				<InboxFab />
			</div>
			<Hidden smUp>
				<div className={classes.bottomNavigationSpacer} />
				<BottomNavigation showLabels value={tabValue} onChange={onTabChange} className={classes.stickToBottom}>
					<BottomNavigationAction label='Inbox' icon={<MUIInbox />} />
					<BottomNavigationAction label='Archived' icon={<Archive />} />
					<BottomNavigationAction label='Favorite' icon={<Favorite />} />
					<BottomNavigationAction label='Trash' icon={<Delete />} />
				</BottomNavigation>
			</Hidden>
		</>)
	}
}

const mapState = (state) => ({
	mail: state.mail,
	searchInput: state.searchInput,
	sort: state.sort.mail,
	selection: state.selection.mail
})
const mapDispatch = (dispatch) => ({
	setSelection: dispatch.selection.setMailSelection
})
export default connect(mapState, mapDispatch)(Inbox)