import { RootModel } from '.'
import { createModel } from '@rematch/core'
import rfdc from 'rfdc'

const clone = rfdc()

const state: Noonly.State.FileInvite = {}
const fileInvites = createModel<RootModel>()({
	state,
	reducers: {
		set: (state, payload: Noonly.State.FileInvite) => payload,
		_delete(state, payload: Noonly.Action.FileInviteDelete) {
			const clonedState = clone(state)
			delete clonedState[payload.id]
			return clonedState
		}
	}
})

export default fileInvites