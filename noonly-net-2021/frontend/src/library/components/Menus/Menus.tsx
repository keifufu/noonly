import AccountIconMenu from './menus/AccountIconMenu'
import AccountMenu from './menus/AccountMenu'
import CloudMenu from './menus/CloudMenu'
import FileMenu from './menus/FileMenu'
import MailMenu from './menus/MailMenu'
import { Portal } from '@chakra-ui/react'
import { RootState } from 'main/store/store'
import ScreenshotMenu from './menus/ScreenshotMenu'
import { memo } from 'react'
import { useSelector } from 'react-redux'

const Menus: React.FC = memo(() => {
	const contextMenu = useSelector((state: RootState) => state.contextMenu)

	return (
		<Portal>
			<AccountMenu id={1} contextMenu={contextMenu} />
			<ScreenshotMenu id={2} contextMenu={contextMenu} />
			<MailMenu id={3} contextMenu={contextMenu} />
			<AccountIconMenu id={4} contextMenu={contextMenu} />
			<CloudMenu id={5} contextMenu={contextMenu} />
			<FileMenu id={6} contextMenu={contextMenu} />
		</Portal>
	)
})

export default Menus