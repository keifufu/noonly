import CloudDeleteSharedDialog from './dialoges/CloudDeleteSharedDialog'
import CloudCreateFolderDialog from './dialoges/CloudCreateFolderDialog'
import ScreenshotDetailsDialog from './dialoges/ScreenshotDetailsDialog'
import MailDeleteAddressDialog from './dialoges/MailDeleteAddressDialog'
import ScreenshotDeleteDialog from './dialoges/ScreenshotDeleteDialog'
import CloudCreateFileDialog from './dialoges/CloudCreateFileDialog'
import PasswordCreateDialog from './dialoges/PasswordCreateDialog'
import PasswordDeleteDialog from './dialoges/PasswordDeleteDialog'
import MailAddAddressDialog from './dialoges/MailAddAddressDialog'
import FriendRemoveDialog from './dialoges/FriendRemoveDialog'
import PasswordEditDialog from './dialoges/PasswordEditDialog'
import PasswordIconDialog from './dialoges/PasswordIconDialog'
import PasswordNoteDialog from './dialoges/PasswordNoteDialog'
import CloudRenameDialog from './dialoges/CloudRenameDialog'
import MailComposeDialog from './dialoges/MailComposeDialog'
import CloudDeleteDialog from './dialoges/CloudDeleteDialog'
import MailDeleteDialog from './dialoges/MailDeleteDialog'
import CloudShareDialog from './dialoges/CloudShareDialog'
import MailManageDialog from './dialoges/MailManageDialog'
import CloudTreeDialog from './dialoges/CloudTreeDialog'
import FriendAddDialog from './dialoges/FriendAddDialog'

function Dialoges() {
	return (<>
		<PasswordCreateDialog id={1} />
		<PasswordDeleteDialog id={2} />
		<PasswordEditDialog id={3} />
		<PasswordNoteDialog id={4} />
		<PasswordIconDialog id={5} />
		<ScreenshotDeleteDialog id={6} />
		<ScreenshotDetailsDialog id={7} />
		<MailDeleteDialog id={8} />
		<CloudCreateFolderDialog id={9} />
		<CloudRenameDialog id={10} />
		<CloudDeleteDialog id={11} />
		<CloudShareDialog id={12} />
		<CloudDeleteSharedDialog id={13} />
		<CloudCreateFileDialog id={14} />
		<CloudTreeDialog id={15} />
		<FriendAddDialog id={16} />
		<FriendRemoveDialog id={17} />
		<MailManageDialog id={18} />
		<MailDeleteAddressDialog id={19} />
		<MailAddAddressDialog id={20} />
		<MailComposeDialog id={21} />
	</>)
}

export default Dialoges