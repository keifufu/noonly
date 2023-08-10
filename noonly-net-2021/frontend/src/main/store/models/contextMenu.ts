import { createModel } from '@rematch/core'
import { RootModel } from '.'
import store from '../store'

let timeout: NodeJS.Timeout | undefined
const state: Noonly.State.ContextMenu = {
	cursors: {},
	onClose: null,
	id: null,
	data: {}
}

const contextMenu = createModel<RootModel>()({
	state,
	reducers: {
		set: (state, payload) => payload,
		_open(state, payload: Noonly.Action.ContextMenuOpen) {
			const cursors = {
				x: payload.e.clientX,
				y: payload.e.clientY
			}
			return {
				cursors,
				onClose: () => {
					timeout = setTimeout(() => {
						store.dispatch.contextMenu.close()
					}, 500)
				},
				id: payload.id,
				data: payload.data || {}
			}
		},
		close(state, payload: Noonly.Action.ContextMenuClose) {
			return {
				/* Don't reset cursors */
				cursors: state.cursors,
				onClose: null,
				id: null,
				/* Don't reset data */
				data: state.data
			}
		}
	},
	effects: (dispatch) => ({
		open({ id, e, data }: Noonly.Effect.ContextMenuOpen, rootState) {
			const isOpenAlready = rootState.contextMenu.id !== null && !timeout
			clearTimeout(timeout as NodeJS.Timeout)
			timeout = undefined
			e.preventDefault()
			/* If menu with id is already open, close current one first, then open it again after closing animation has finished */
			if (isOpenAlready) dispatch.contextMenu.close()
			setTimeout(() => {
				dispatch.contextMenu._open({ id, e, data })
			}, isOpenAlready ? 150 : 0)
		}
	})
})

export default contextMenu