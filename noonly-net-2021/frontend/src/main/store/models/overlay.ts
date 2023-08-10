import { RootModel } from '.'
import { createModel } from '@rematch/core'
import store from '../store'

const state: Noonly.State.Overlay = {
	onClose: null,
	id: null,
	data: {}
}

const overlay = createModel<RootModel>()({
	state,
	reducers: {
		set: (state, payload: Noonly.State.Overlay) => payload,
		open(state, payload: Noonly.Action.OverlayOpen) {
			const close = () => store.dispatch.overlay.close()
			return {
				onClose: close,
				id: payload.id,
				data: payload.data || {}
			}
		},
		close(state, payload: Noonly.Action.OverlayClose) {
			return {
				onClose: null,
				id: null,
				/* Don't reset data */
				data: state.data
			}
		}
	}
})

export default overlay