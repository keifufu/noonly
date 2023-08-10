import { connect } from 'react-redux'

import MagnifierBackdrop from './backdrops/MagnifierBackdrop'

function Backdrops({ backdrop }) {
	const { open, payload } = backdrop

	return (<>
		<MagnifierBackdrop open={open === 1} payload={payload} />
	</>)
}

const mapState = (state) => ({
	backdrop: state.backdrop
})
const mapDispatch = (dispatch) => ({})
export default connect(mapState, mapDispatch)(Backdrops)