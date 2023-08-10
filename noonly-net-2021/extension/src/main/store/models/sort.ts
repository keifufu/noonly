import { RootModel } from '.'
import { createModel } from '@rematch/core'
import getSortingOptions from 'library/utilities/getSortingOptions'
import rfdc from 'rfdc'
import storage from 'library/utilities/storage'

const clone = rfdc()

let savedState = storage.getItem('sort', false, null)
if (!savedState?.screenshots || !savedState?.accounts || !savedState?.cloud)
	savedState = null

const state: Noonly.State.Sort = savedState || {
	screenshots: {
		direction: 'down',
		method: getSortingOptions('/screenshots')[0]
	},
	accounts: {
		direction: 'down',
		method: getSortingOptions('/accounts')[0]
	},
	cloud: {
		direction: 'down',
		method: getSortingOptions('/cloud')[0]
	}
}

const saveState = (state: Noonly.State.Sort) => storage.setItem('sort', state)

const sort = createModel<RootModel>()({
	state,
	reducers: {
		setDirection(state, payload: Noonly.Action.SortSetDirection) {
			const clonedState = clone(state)
			if (!clonedState[payload.type]) return state
			clonedState[payload.type].direction = payload.direction
			saveState(clonedState)
			return clonedState
		},
		setMethod(state, payload: Noonly.Action.SortSetMethod) {
			const clonedState = clone(state)
			if (!clonedState[payload.type]) return state
			clonedState[payload.type].method = payload.method
			saveState(clonedState)
			return clonedState
		}
	}
})

export default sort