import send from '@main/routes/smtp/send'
import accountsClearTrash from '@routes/accounts/clearTrash'
import accountsCreate from '@routes/accounts/create'
import accountsDelete from '@routes/accounts/delete'
import accountsEdit from '@routes/accounts/edit'
import accountsEditIcon from '@routes/accounts/editIcon'
import accountsEditNote from '@routes/accounts/editNote'
import accountsEditTrash from '@routes/accounts/editTrash'
import accountsFavicon from '@routes/accounts/favicon'
import accountsFetch from '@routes/accounts/fetch'
import accountsIcon from '@routes/accounts/icon'
import accountsSetMfaSecret from '@routes/accounts/setMfaSecret'
import authLogin from '@routes/auth/login'
import authRegister from '@routes/auth/register'
import mailClearTrash from '@routes/mail/clearTrash'
import mailDelete from '@routes/mail/delete'
import mailDownloadAttachment from '@routes/mail/downloadAttachment'
import mailEditArchived from '@routes/mail/editArchived'
import mailEditRead from '@routes/mail/editRead'
import mailEditTrash from '@routes/mail/editTrash'
import screenshotsClearTrash from '@routes/screenshots/clearTrash'
import screenshotsDelete from '@routes/screenshots/delete'
import screenshotsEditFavorite from '@routes/screenshots/editFavorite'
import screenshotsEditTrash from '@routes/screenshots/editTrash'
import screenshotsUpload from '@routes/screenshots/upload'
import screenshotsView from '@routes/screenshots/view'
import screenshotsViewRaw from '@routes/screenshots/viewRaw'
import userAddAddress from '@routes/user/addAddress'
import userAvatar from '@routes/user/avatar'
import userDeleteIcon from '@routes/user/deleteIcon'
import userEditAddressName from '@routes/user/editAddressName'
import userFetch from '@routes/user/fetch'
import userRemoveAddresses from '@routes/user/removeAddress'
import userUpdateAddresses from '@routes/user/updateAddresses'
import userUploadAvatar from '@routes/user/uploadAvatar'
import userUploadIcon from '@routes/user/uploadIcon'
import alive from './alive'
import getAddresses from './smtp/getAddresses'

export default [
	alive,
	accountsClearTrash,
	accountsCreate,
	accountsDelete,
	accountsEdit,
	accountsEditIcon,
	accountsEditNote,
	accountsEditTrash,
	accountsFavicon,
	accountsFetch,
	accountsIcon,
	accountsSetMfaSecret,
	authLogin,
	authRegister,
	mailClearTrash,
	mailDelete,
	mailDownloadAttachment,
	mailEditArchived,
	mailEditRead,
	mailEditTrash,
	screenshotsClearTrash,
	screenshotsDelete,
	screenshotsEditFavorite,
	screenshotsEditTrash,
	screenshotsUpload,
	screenshotsView,
	screenshotsViewRaw,
	userAddAddress,
	userAvatar,
	userDeleteIcon,
	userEditAddressName,
	userFetch,
	userRemoveAddresses,
	userUpdateAddresses,
	userUploadAvatar,
	userUploadIcon,
	send,
	getAddresses
]