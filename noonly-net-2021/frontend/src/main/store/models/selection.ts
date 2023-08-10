import { RootModel } from '.'
import { createModel } from '@rematch/core'
import rfdc from 'rfdc'

const clone = rfdc()

const state: Noonly.State.Selection = {
	screenshots: [],
	mail: [],
	files: []
}

const selection = createModel<RootModel>()({
	state,
	reducers: {
		toggleSelection(state, payload: Noonly.Action.SelectionToggleSelection) {
			if (state[payload.type].includes(payload.id)) {
				const clonedState = clone(state[payload.type])
				return {
					...state,
					[payload.type]: clonedState.filter((e) => e !== payload.id)
				}
			} else {
				return {
					...state,
					[payload.type]: [
						...state[payload.type],
						payload.id
					]
				}
			}
		},
		setSelection(state, payload: Noonly.Action.SelectionSetSelection) {
			return {
				...state,
				[payload.type]: payload.ids
			}
		}
	}
})

export default selection