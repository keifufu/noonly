import MAIL_ORDER_AND_VISIBILITY_UPDATE from './handlers/MAIL_ORDER_AND_VISIBILITY_UPDATE'
import SCREENSHOT_EDIT_FAVORITE from './handlers/SCREENSHOT_EDIT_FAVORITE'
import SYNC_PASSWORDGENERATOR from './handlers/SYNC_PASSWORDGENERATOR'
import SCREENSHOT_EDIT_TRASH from './handlers/SCREENSHOT_EDIT_TRASH'
import MAIL_ADDRESS_CREATED from './handlers/MAIL_ADDRESS_CREATED'
import MAIL_CONTENT_FETCHED from './handlers/MAIL_CONTENT_FETCHED'
import MAIL_ARCHIVED_UPDATE from './handlers/MAIL_ARCHIVED_UPDATE'
import MAIL_FAVORITE_UPDATE from './handlers/MAIL_FAVORITE_UPDATE'
import MAIL_ADDRESS_DELETED from './handlers/MAIL_ADDRESS_DELETED'
import ACCOUNT_ICON_UPDATE from './handlers/ACCOUNT_ICON_UPDATE'
import CLOUD_PARENT_UPDATE from './handlers/CLOUD_PARENT_UPDATE'
import SCREENSHOTS_LOADED from './handlers/SCREENSHOTS_LOADED'
import CLOUD_TRASH_UPDATE from './handlers/CLOUD_TRASH_UPDATE'
import MAIL_TRASH_UPDATE from './handlers/MAIL_TRASH_UPDATE'
import SCREENSHOT_DELETE from './handlers/SCREENSHOT_DELETE'
import SCREENSHOT_UPLOAD from './handlers/SCREENSHOT_UPLOAD'
import CLOUD_CREATE_FILE from './handlers/CLOUD_CREATE_FILE'
import CLOUD_DELETE_FILE from './handlers/CLOUD_DELETE_FILE'
import CLOUD_FILE_RENAME from './handlers/CLOUD_FILE_RENAME'
import MAIL_READ_UPDATE from './handlers/MAIL_READ_UPDATE'
import CLOUD_SET_SHARED from './handlers/CLOUD_SET_SHARED'
import ACCOUNTS_LOADED from './handlers/ACCOUNTS_LOADED'
import ACCOUNT_DELETE from './handlers/ACCOUNT_DELETE'
import ACCOUNT_CREATE from './handlers/ACCOUNT_CREATE'
import CLOUD_FETCHED from './handlers/CLOUD_FETCHED'
import MAIL_INCOMING from './handlers/MAIL_INCOMING'
import MAIL_FETCHED from './handlers/MAIL_FETCHED'
import INITIAL_LOAD from './handlers/INITIAL_LOAD'
import MAIL_DELETE from './handlers/MAIL_DELETE'
import storage from 'library/utilities/storage'
import apiHost from 'library/utilities/apiHost'
import SYNC_THEME from './handlers/SYNC_THEME'
import io from 'socket.io-client'

const locations = ['inbox', 'screenshots', 'passwords', 'cloud', 'chat', 'settings']
const pathname = window.location.pathname.split('/')[1].toLowerCase()
let _location = pathname
if (!locations.includes(pathname))
	_location = 'inbox'
if (pathname === 'settings')
	_location = null
const socket = io(apiHost, {
	extraHeaders: { AUthorization: `Bearer ${storage.jwt_token}` },
	query: `?location=${_location}`,
	path: '/socket'
})
window.addEventListener('beforeunload', () => socket.disconnect())

socket.awaitInitialLoad = () => {
	const poll = (resolve) => {
		if (socket._initialLoad) resolve()
		else setTimeout(() => poll(resolve), 400)
	}
	return new Promise(poll)
}

socket.on('INITIAL_LOAD', INITIAL_LOAD)
socket.on('MAIL_FETCHED', MAIL_FETCHED)
socket.on('SCREENSHOTS_LOADED', SCREENSHOTS_LOADED)
socket.on('ACCOUNTS_LOADED', ACCOUNTS_LOADED)
socket.on('CLOUD_FETCHED', CLOUD_FETCHED)
socket.on('SCREENSHOT_UPLOAD', SCREENSHOT_UPLOAD)
socket.on('SCREENSHOT_DELETE', SCREENSHOT_DELETE)
socket.on('SCREENSHOT_EDIT_TRASH', SCREENSHOT_EDIT_TRASH)
socket.on('SCREENSHOT_EDIT_FAVORITE', SCREENSHOT_EDIT_FAVORITE)
socket.on('ACCOUNT_ICON_UPDATE', ACCOUNT_ICON_UPDATE)
socket.on('ACCOUNT_DELETE', ACCOUNT_DELETE)
socket.on('ACCOUNT_CREATE', ACCOUNT_CREATE)
socket.on('CLOUD_CREATE_FILE', CLOUD_CREATE_FILE)
socket.on('CLOUD_DELETE_FILE', CLOUD_DELETE_FILE)
socket.on('CLOUD_SET_SHARED', CLOUD_SET_SHARED)
socket.on('CLOUD_FILE_RENAME', CLOUD_FILE_RENAME)
socket.on('CLOUD_PARENT_UPDATE', CLOUD_PARENT_UPDATE)
socket.on('CLOUD_TRASH_UPDATE', CLOUD_TRASH_UPDATE)
socket.on('MAIL_INCOMING', MAIL_INCOMING)
socket.on('MAIL_ARCHIVED_UPDATE', MAIL_ARCHIVED_UPDATE)
socket.on('MAIL_FAVORITE_UPDATE', MAIL_FAVORITE_UPDATE)
socket.on('MAIL_DELETE', MAIL_DELETE)
socket.on('MAIL_READ_UPDATE', MAIL_READ_UPDATE)
socket.on('MAIL_TRASH_UPDATE', MAIL_TRASH_UPDATE)
socket.on('MAIL_CONTENT_FETCHED', MAIL_CONTENT_FETCHED)
socket.on('MAIL_ADDRESS_CREATED', MAIL_ADDRESS_CREATED)
socket.on('MAIL_ADDRESS_DELETED', MAIL_ADDRESS_DELETED)
socket.on('MAIL_ORDER_AND_VISIBILITY_UPDATE', MAIL_ORDER_AND_VISIBILITY_UPDATE)
socket.on('SYNC_THEME', SYNC_THEME)
socket.on('SYNC_PASSWORDGENERATOR', SYNC_PASSWORDGENERATOR)

export default socket