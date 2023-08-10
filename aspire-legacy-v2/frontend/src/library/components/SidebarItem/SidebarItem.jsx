import { Avatar, Badge, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Tooltip } from '@material-ui/core'
import { useLocation } from 'react-router-dom'

function SidebarItem({ sidebarOpen, text, icon, iconURL, location, badgeContent, onClick, isSelected }) {
	const { pathname } = useLocation()
	const Icon = icon

	return (
		<Tooltip title={sidebarOpen ? '' : text} placement='right' enterDelay={500}>
			<ListItem button onClick={onClick} selected={typeof isSelected === 'function' ? isSelected(pathname) : pathname.startsWith(location)}>
				{
					iconURL
						? <ListItemAvatar style={{ marginLeft: -8 }}>
							<Badge color='primary' badgeContent={badgeContent}>
								<Avatar src={iconURL} />
							</Badge>
						</ListItemAvatar>
						: <ListItemIcon>
							<Badge color='primary' badgeContent={badgeContent}>
								<Icon />
							</Badge>
						</ListItemIcon>
				}
				<ListItemText primary={text}/>
			</ListItem>
		</Tooltip>
	)
}

export default SidebarItem