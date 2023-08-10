import { RootModel } from '.'
import { createModel } from '@rematch/core'
import rfdc from 'rfdc'

const clone = rfdc()

const state: Noonly.State.InitialLoad = {
	app: false,
	mail: false,
	accounts: false,
	screenshots: false,
	files: false
}

const initialLoad = createModel<RootModel>()({
	state,
	reducers: {
		set: (state, payload: Noonly.Action.InitialLoadSet) => {
			const clonedState = clone(state)
			clonedState[payload.type] = payload.value as any
			return clonedState
		}
	}
})

export default initialLoad