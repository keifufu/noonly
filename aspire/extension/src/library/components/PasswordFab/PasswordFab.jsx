import { Add, DeleteForever, ExpandLess } from '@material-ui/icons'
import { useScrollTrigger } from '@material-ui/core'
import { useLocation } from 'react-router'
import { useDispatch } from 'react-redux'

import Fab from 'library/components/Fab'

function PasswordFab(props) {
	const { window } = props
	const dispatch = useDispatch()
	const location = useLocation()
	const displayTrash = location.pathname.includes('/passwords/trash')
	// eslint-disable-next-line no-undefined
	const trigger = useScrollTrigger({ target: window ? window() : undefined, disableHysteresis: true })

	const scrollBackUp = (e) => {
		const anchor = (e.target.ownerDocument || document).querySelector('#back-to-top-anchor')
		if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
	}

	return (
		displayTrash
			? trigger
				? <Fab text='Scroll to top' icon={ExpandLess} onClick={scrollBackUp} />
				: <Fab text='Clear Trash' icon={DeleteForever} onClick={() => dispatch.dialog.open({ id: 2, payload: 'clear' })} />
			: trigger
				? <Fab text='Scroll to top' icon={ExpandLess} onClick={scrollBackUp} />
				: <Fab text='Create' icon={Add} onClick={() => dispatch.dialog.open({ id: 1 })} />
	)
}

export default PasswordFab