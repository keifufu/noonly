import CloudDeleteSharedDialog from './dialoges/CloudDeleteSharedDialog'
import CloudCreateFolderDialog from './dialoges/CloudCreateFolderDialog'
import ScreenshotDetailsDialog from './dialoges/ScreenshotDetailsDialog'
import MailDeleteAddressDialog from './dialoges/MailDeleteAddressDialog'
import ScreenshotDeleteDialog from './dialoges/ScreenshotDeleteDialog'
import CloudCreateFileDialog from './dialoges/CloudCreateFileDialog'
import MailAddAddressDialog from './dialoges/MailAddAddressDialog'
import AccountDeleteDialog from './dialoges/AccountDeleteDialog'
import AccountCreateDialog from './dialoges/AccountCreateDialog'
import FriendRemoveDialog from './dialoges/FriendRemoveDialog'
import AccountEditDialog from './dialoges/AccountEditDialog'
import AccountIconDialog from './dialoges/AccountIconDialog'
import AccountNoteDialog from './dialoges/AccountNoteDialog'
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
		<AccountCreateDialog id={1} />
		<AccountDeleteDialog id={2} />
		<AccountEditDialog id={3} />
		<AccountNoteDialog id={4} />
		<AccountIconDialog id={5} />
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