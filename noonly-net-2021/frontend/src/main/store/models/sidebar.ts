import { RootModel } from '.'
import { createModel } from '@rematch/core'

const state: Noonly.State.Sidebar = {
	open: false
}

const sidebar = createModel<RootModel>()({
	state,
	reducers: {
		toggle(state, payload: Noonly.Action.SidebarToggle) {
			return { open: !state.open }
		},
		setOpen(state, payload: Noonly.Action.SidebarSetOpen) {
			return { open: payload }
		}
	}
})

export default sidebar