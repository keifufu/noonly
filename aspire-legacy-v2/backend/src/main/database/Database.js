import ScreenshotActions from '#main/database/actions/ScreenshotActions'
import DatabaseConnection from '#main/database/DatabaseConnection'
import UserActions from '#main/database/actions/UserActions'
import SettingsActions from './actions/SettingsActions'
import PasswordActions from './actions/PasswordActions'
import ChannelActions from './actions/ChannelActions'
import FriendActions from './actions/FriendActions'
import CloudActions from './actions/CloudActions'
import MailActions from './actions/MailActions'

class Database extends DatabaseConnection {
	constructor(credentials) {
		super(credentials)
		this.screenshots = new ScreenshotActions(this.query.bind(this))
		this.passwords = new PasswordActions(this.query.bind(this))
		this.settings = new SettingsActions(this.query.bind(this))
		this.channels = new ChannelActions(this.query.bind(this))
		this.friends = new FriendActions(this.query.bind(this))
		this.cloud = new CloudActions(this.query.bind(this))
		this.users = new UserActions(this.query.bind(this))
		this.mail = new MailActions(this.query.bind(this))
	}
}

export default Database