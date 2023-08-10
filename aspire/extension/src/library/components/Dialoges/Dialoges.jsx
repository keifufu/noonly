import PasswordCreateDialog from './dialoges/PasswordCreateDialog'
import PasswordDeleteDialog from './dialoges/PasswordDeleteDialog'
import PasswordEditDialog from './dialoges/PasswordEditDialog'
import PasswordIconDialog from './dialoges/PasswordIconDialog'
import PasswordNoteDialog from './dialoges/PasswordNoteDialog'

function Dialoges() {
	return (<>
		<PasswordCreateDialog id={1} />
		<PasswordDeleteDialog id={2} />
		<PasswordEditDialog id={3} />
		<PasswordNoteDialog id={4} />
		<PasswordIconDialog id={5} />
	</>)
}

export default Dialoges