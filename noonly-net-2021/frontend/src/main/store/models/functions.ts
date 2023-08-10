import { RootModel } from '.'
import { createModel } from '@rematch/core'
import rfdc from 'rfdc'

const clone = rfdc()

const state: Noonly.State.Functions = {
	onBlockLocationChange: null
}

const functions = createModel<RootModel>()({
	state,
	reducers: {
		setBlockLocationChange(state, payload: Noonly.Action.FunctionsSetBlockLocationChange) {
			const clonedState = clone(state)
			clonedState.onBlockLocationChange = payload.func
			return clonedState
		}
	}
})

export default functions