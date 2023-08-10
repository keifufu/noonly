import AccountIconMenu from './menus/AccountIconMenu'
import AccountMenu from './menus/AccountMenu'
import { Portal } from '@chakra-ui/react'
import { RootState } from 'main/store/store'
import { memo } from 'react'
import { useSelector } from 'react-redux'

const Menus: React.FC = memo(() => {
	const contextMenu = useSelector((state: RootState) => state.contextMenu)

	return (
		<Portal>
			<AccountMenu id={1} contextMenu={contextMenu} />
			<AccountIconMenu id={4} contextMenu={contextMenu} />
		</Portal>
	)
})

export default Menus