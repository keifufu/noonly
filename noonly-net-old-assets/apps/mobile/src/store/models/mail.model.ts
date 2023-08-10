import { RootModel } from '.'
import { createModel } from '@rematch/core'

const state: any[] = []
const MailModel = createModel<RootModel>()({
	state,
	reducers: {
		set: (state, payload) => Object.values(payload)
	},
	effects: (dispatch) => ({
		refresh(payload, rootState) {
			//
		}
	})
})

export default MailModel