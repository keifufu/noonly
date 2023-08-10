import { RootModel } from '.'
import { createModel } from '@rematch/core'
import rfdc from 'rfdc'
import store from '../store'

const clone = rfdc()

const state: Noonly.State.Modal = {
	mostRecentModal: 0
}

const modal = createModel<RootModel>()({
	state,
	reducers: {
		set: (state, payload: Noonly.State.Modal) => payload,
		open(state, payload: Noonly.Action.ModalOpen) {
			const clonedState = clone(state)
			clonedState[payload.id] = {
				open: true,
				onClose: () => store.dispatch.modal.close({ id: payload.id }),
				data: payload.data || {}
			}
			clonedState.mostRecentModal = payload.id
			return clonedState
		},
		close(state, payload: Noonly.Action.ModalClose) {
			const clonedState = clone(state)
			clonedState[payload.id] = {
				...clonedState[payload.id],
				open: false
			}
			return clonedState
		}
	}
})

export default modal