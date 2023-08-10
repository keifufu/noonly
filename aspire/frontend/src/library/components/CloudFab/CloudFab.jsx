import { useScrollTrigger } from '@material-ui/core'
import { Add, DeleteForever, ExpandLess } from '@material-ui/icons'
import { useLocation } from 'react-router'
import { useDispatch } from 'react-redux'

import Fab from 'library/components/Fab'

function CloudFab(props) {
	const { window, currentParentId } = props
	// eslint-disable-next-line no-undefined
	const trigger = useScrollTrigger({ target: window ? window() : undefined, disableHysteresis: true })
	const location = useLocation()
	const dispatch = useDispatch()

	const displayTrash = location.pathname.startsWith('/cloud/trash')

	const scrollBackUp = (e) => {
		const anchor = (e.target.ownerDocument || document).querySelector('#back-to-top-anchor')
		if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
	}

	return (
		displayTrash
			? trigger
				? <Fab text='Scroll to top' icon={ExpandLess} onClick={scrollBackUp} />
				: <Fab text='Clear Trash' icon={DeleteForever} onClick={() => {
					dispatch.dialog.open({
						id: 11,
						payload: { action: 'Clear Trash' }
					})
				}} />
			: trigger
				? <Fab text='Scroll to top' icon={ExpandLess} onClick={scrollBackUp} />
				: <div>
					<input
						style={{ display: 'none' }}
						onChange={({ target }) => {
							Object.values(target.files).forEach((file) => {
								dispatch.cloud.uploadFile({
									parent_id: currentParentId,
									file
								})
							})
							const el = document.getElementById('file-upload')
							el.value = ''
						}}
						id='file-upload'
						multiple
						type='file'
					/>
					<Fab text='Upload' icon={Add} onClick={() => {
						const el = document.getElementById('file-upload')
						el.click()
					}} />
				</div>
	)
}

export default CloudFab