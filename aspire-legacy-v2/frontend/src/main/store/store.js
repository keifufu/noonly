import { init } from '@rematch/core'

import notifications from './models/notifications'
import contextMenu from './models/contextMenu'
import searchInput from './models/searchInput'
import screenshots from './models/screenshots'
import initialLoad from './models/initialLoad'
import selection from './models/selection'
import channels from './models/channels'
import backdrop from './models/backdrop'
import accounts from './models/accounts'
import friends from './models/friends'
import sidebar from './models/sidebar'
import dialog from './models/dialog'
import theme from './models/theme'
import cloud from './models/cloud'
import sort from './models/sort'
import mail from './models/mail'

const store = init({
	models: {
		accounts,
		backdrop,
		channels,
		cloud,
		contextMenu,
		dialog,
		friends,
		initialLoad,
		mail,
		notifications,
		screenshots,
		searchInput,
		selection,
		sidebar,
		sort,
		theme
	}
})

export default store