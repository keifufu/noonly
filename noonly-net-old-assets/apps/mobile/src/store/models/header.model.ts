import { RootModel } from '.'
import { createModel } from '@rematch/core'

const state: any = {
	displayMailActions: false
}
const HeaderModel = createModel<RootModel>()({
	state,
	reducers: {
		setDisplayMailActions: (state, payload: boolean) => ({
			...state,
			displayMailActions: payload
		})
	},
	effects: (dispatch) => ({
		refresh(payload, rootState) {
			//
		}
	})
})

export default HeaderModel