// eslint-disable-next-line max-len
import { Archive, ArrowDropDown, Delete, DeleteForever, Edit, GetApp, IndeterminateCheckBox, Markunread, MoveToInbox, Refresh, Star, StarOutline } from '@material-ui/icons'
import { Badge, Card, Checkbox, Hidden, makeStyles, MenuItem, Tooltip, useTheme, Divider } from '@material-ui/core'
import { useHistory, useLocation } from 'react-router'
import { connect } from 'react-redux'

import downloadMail from 'library/common/download/downloadMail'
import IconButton from 'library/components/IconButton'
import apiHost from 'library/utilities/apiHost'
import Select from 'library/components/Select'

const useStyles = makeStyles((theme) => ({
	root: {
		marginBottom: theme.spacing(1),
		paddingLeft: theme.spacing(1),
		alignItems: 'center',
		display: 'flex',
		height: 48
	},
	selectWrapper: {
		marginRight: theme.spacing(1),
		marginLeft: 'auto',
		order: 2
	},
	select: {
		marginLeft: theme.spacing(1)
	}
}))

// eslint-disable-next-line max-len
function MailToolbar({ page, setPage, selection, mail: _mail, setSelection, setRead, setFavorite, setTrash, setArchived, refresh, openDialog, setSelectedAddress }) {
	const classes = useStyles()
	const history = useHistory()
	const location = useLocation()
	const locationString = location.pathname.includes('/inbox/trash')
		? 'Trash'
		: location.pathname.includes('/inbox/archived')
			? 'Archived'
			: location.pathname.includes('/inbox/favorite')
				? 'Favorite'
				: 'Inbox'
	const displayTrash = location.pathname.includes('/inbox/trash')
	const displayArchived = location.pathname.includes('/inbox/archived')
	const displayFavorite = location.pathname.includes('/inbox/favorite')
	const mail = Object.values(_mail[_mail.selected])
		.sort((a, b) => b.date - a.date)
		.filter((e) => (e.trash ? displayTrash : !displayTrash))
		.filter((e) => (e.archived ? displayArchived : !displayArchived))
		.filter((e) => (e.favorite ? true : !displayFavorite))
	const currentPageIds = mail.slice((page - 1) * 25, page * 25).map((e) => e.id)
	const selectedMail = Object.values(_mail[_mail.selected]).filter((e) => selection.includes(e.id))
	const theme = useTheme()

	const totalIncoming = Object.values(_mail.incoming).length === 0 ? 0 : Object.values(_mail.incoming).reduce((a, v) => a + v)
	const totalUnread = Object.values(_mail.unread).length === 0 ? 0 : Object.values(_mail.unread).reduce((a, v) => a + v)

	const allAddresses = Object.keys(_mail).filter((e) => e.includes(`@${process.env.REACT_APP_HOSTNAME}`)).sort((a, b) => _mail.order[a] - _mail.order[b])

	const addresses = allAddresses.filter((e) => _mail.visible[e])
	const hiddenAddresses = allAddresses.filter((e) => !_mail.visible[e])

	const attentionAddresses = []
	let hiddenUnread = 0
	let hiddenIncoming = false
	hiddenAddresses.forEach((address) => {
		let hasAttention = false
		const unread = _mail.unread[address]
		if (unread) {
			hiddenUnread += unread
			hasAttention = true
		}
		const incoming = _mail.incoming[address]
		if (incoming) {
			hiddenIncoming = true
			hasAttention = true
		}
		if (hasAttention) attentionAddresses.push(address)
	})

	const onChange = (e, x) => {
		if (x.props.value === 'Inbox')
			history.push('/inbox')
		else if (x.props.value === 'Archived')
			history.push('/inbox/archived')
		else if (x.props.value === 'Favorite')
			history.push('/inbox/favorite')
		else if (x.props.value === 'Trash')
			history.push('/inbox/trash')
		setSelection([])
		setPage(1)
	}

	const buttons = [{
		icon: () => (
			_mail.incoming[_mail.selected]
				? <Badge
					badgeContent={ <div style={{ fontSize: 14 }}>!</div> }
					color='primary'
					anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
				>
					<Refresh />
				</Badge>
				: <Refresh />
		),
		tooltip: 'Refresh',
		visible: selection.length === 0,
		onClick: () => {
			refresh()
			onChange(null, { props: { value: 'Inbox' } })
		}
	}, {
		icon: Markunread,
		tooltip: 'Mark all as read',
		visible: selection.length === 0,
		onClick: () => {
			setRead({
				ids: Object.keys(_mail[_mail.selected]),
				read: true
			})
		}
	}, {
		icon: Archive,
		tooltip: 'Archive',
		visible: selection.length > 0 && locationString === 'Inbox',
		onClick: () => {
			setArchived({
				ids: selection,
				archived: true
			})
			setSelection([])
		}
	}, {
		icon: Archive,
		tooltip: 'Unarchive',
		visible: selection.length > 0 && locationString === 'Archived',
		onClick: () => {
			setArchived({
				ids: selection,
				archived: false
			})
			setSelection([])
		}
	}, {
		icon: Markunread,
		tooltip: 'Mark as unread',
		visible: selection.length > 0 && selectedMail.filter((e) => !!e.isread).length === selection.length,
		onClick: () => {
			setRead({
				ids: selection,
				read: false
			})
			setSelection([])
		}
	}, {
		icon: Markunread,
		tooltip: 'Mark as read',
		visible: selection.length > 0 && selectedMail.filter((e) => !!e.isread).length !== selection.length,
		onClick: () => {
			setRead({
				ids: selection,
				read: true
			})
			setSelection([])
		}
	}, {
		icon: Star,
		tooltip: 'Add to favorites',
		visible: selection.length > 0 && selectedMail.filter((e) => !!e.favorite).length !== selection.length,
		onClick: () => {
			setFavorite({
				ids: selection,
				favorite: true
			})
			setSelection([])
		}
	}, {
		icon: StarOutline,
		tooltip: 'Remove from favorites',
		visible: selection.length > 0 && selectedMail.filter((e) => !!e.favorite).length === selection.length,
		onClick: () => {
			setFavorite({
				ids: selection,
				favorite: false
			})
			setSelection([])
		}
	}, {
		icon: GetApp,
		tooltip: 'Download',
		visible: selection.length > 0,
		onClick: () => {
			const items = selection.map((id) => ({
				url: `${apiHost}/mail/download?id=${id}`,
				name: `${_mail[_mail.selected][id].messageId}.eml`
			}))
			downloadMail(items, 'Mail.zip')
			setSelection([])
		}
	}, {
		icon: Delete,
		tooltip: 'Move to Trash',
		visible: selection.length > 0 && locationString === 'Inbox',
		onClick: () => {
			setTrash({
				ids: selection,
				trash: true
			})
			setSelection([])
		}
	}, {
		icon: MoveToInbox,
		tooltip: 'Move to Inbox',
		visible: selection.length > 0 && locationString === 'Trash',
		onClick: () => {
			setTrash({
				ids: selection,
				trash: false
			})
			setSelection([])
		}
	}, {
		icon: DeleteForever,
		tooltip: 'Delete Forever',
		visible: selection.length > 0 && locationString === 'Trash',
		onClick: () => {
			openDialog({
				id: 8,
				payload: selection
			})
			/* Selection is reset after confirmation of deletion. */
		}
	}]

	return (
		<Card className={classes.root}>
			<Tooltip title={selection.length > 0 ? 'Unselect all' : 'Select all'} enterDelay={500}>
				<Checkbox
					color='primary'
					onChange={() => {
						if (selection.length > 0)
							setSelection([])
						else
							setSelection(currentPageIds)
					}}
					checked={selection.length > 0}
					checkedIcon={<IndeterminateCheckBox />}
				/>
			</Tooltip>
			{ buttons.map(({ icon, tooltip, visible, onClick }, index) => (
				<IconButton
					icon={icon}
					tooltip={tooltip}
					visible={visible}
					onClick={onClick}
					size={42}
					key={index}
				/>
			)) }
			<div className={classes.selectWrapper}>
				<Hidden xsDown>
					<Select
						onChange={onChange}
						className={classes.select}
						disableUnderline
						value={locationString}
					>
						<MenuItem value='Inbox'>Inbox</MenuItem>
						<MenuItem value='Archived'>Archived</MenuItem>
						<MenuItem value='Favorite'>Favorite</MenuItem>
						<MenuItem value='Trash'>Trash</MenuItem>
					</Select>
				</Hidden>
				<Select
					onChange={(e, x) => {
						if (x.props.value === 'Open Manager') {
							openDialog({
								id: 18
							})
							return
						} else if (x.props.value === 'Open Manager Highlight') {
							openDialog({
								id: 18,
								payload: attentionAddresses
							})
							return
						} else if (x.props.value === 'Divider') {
							return
						}
						setSelectedAddress(x.props.value)
						history.push('/inbox')
						setSelection([])
					}}
					className={classes.select}
					disableUnderline
					value={_mail.selected}
					IconComponent={(props) => {
						if (totalUnread || totalIncoming)
							return <ArrowDropDown {...props} style={{ color: theme.palette.primary.main }} />
						return <ArrowDropDown {...props} />
					}}
				>
					{
						addresses.map((e) => (
							<MenuItem component='div' key={e} value={e} style={{ display: 'flex', justifyContent: 'space-between' }}>
								{_mail.origName[e].split('@')[0]}
								{
									(_mail.unread[e] > 0 || _mail.incoming[e])
									&& <Badge
										anchorOrigin={{
											vertical: 'top',
											horizontal: 'left'
										}}
										style={{
											marginLeft: _mail.unread[e] < 10 ? 15 : 20,
											marginRight: _mail.unread[e] < 10 ? 10 : 15,
											marginBottom: 1
										}}
										badgeContent={
											_mail.incoming[e]
												? <div style={{ fontSize: 14 }}>!</div>
												: _mail.unread[e]
										}
										color='primary'
									/>
								}
							</MenuItem>
						))
					}
					<Divider value='Divider' style={{
						display: (hiddenUnread > 0 || hiddenIncoming) ? 'block' : 'none',
						backgroundColor: theme.palette.primary.main,
						marginTop: 4,
						marginBottom: 4,
						width: 150
					}} />
					<MenuItem
						component='div'
						value='Open Manager Highlight'
						style={{
							display: (hiddenUnread > 0 || hiddenIncoming) ? 'flex' : 'none',
							justifyContent: 'space-between'
						}}
					>
						Hidden
						{
							(hiddenUnread > 0 || hiddenIncoming)
							&& <Badge
								anchorOrigin={{
									vertical: 'top',
									horizontal: 'left'
								}}
								style={{
									marginLeft: hiddenUnread < 10 ? 15 : 20,
									marginRight: hiddenUnread < 10 ? 10 : 15,
									marginBottom: 1
								}}
								badgeContent={
									hiddenIncoming
										? <div style={{ fontSize: 14 }}>!</div>
										: hiddenUnread
								}
								color='primary'
							/>
						}
					</MenuItem>
					<Divider value='Divider' style={{
						backgroundColor: theme.palette.primary.main,
						marginTop: 4,
						marginBottom: 4,
						width: 150
					}} />
					<MenuItem
						component='div'
						value='Open Manager'
					>
						<Edit style={{ marginRight: 10 }} /> Manage
					</MenuItem>
				</Select>
			</div>
		</Card>
	)
}

const mapState = (state) => ({
	selection: state.selection.mail,
	mail: state.mail
})
const mapDispatch = (dispatch) => ({
	setSelection: dispatch.selection.setMailSelection,
	setRead: dispatch.mail.setRead,
	setFavorite: dispatch.mail.setFavorite,
	setTrash: dispatch.mail.setTrash,
	setArchived: dispatch.mail.setArchived,
	refresh: dispatch.mail.refresh,
	openDialog: dispatch.dialog.open,
	setSelectedAddress: dispatch.mail.setSelected
})
export default connect(mapState, mapDispatch)(MailToolbar)