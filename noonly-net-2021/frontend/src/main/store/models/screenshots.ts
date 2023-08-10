import { RootModel } from '.'
import { createModel } from '@rematch/core'
import post from 'main/axios/post'
import toast from 'library/utilities/toast'

const state: Noonly.State.Screenshots = []
const screenshots = createModel<RootModel>()({
	state,
	reducers: {
		set: (state, payload: Noonly.State.Screenshots) => Object.values(payload),
		add(state, payload: Noonly.Action.ScreenshotAdd) {
			return [...state, payload]
		},
		_delete(state, payload: Noonly.Action.ScreenshotDelete) {
			return state.filter((screenshot) => !payload.ids.includes(screenshot.id))
		},
		_editFavorite(state, payload: Noonly.Action.ScreenshotEditFavorite) {
			return state.map((screenshot) => {
				if (payload.ids.includes(screenshot.id))
					return { ...screenshot, favorite: payload.favorite }
				return screenshot
			})
		},
		_editTrash(state, payload: Noonly.Action.ScreenshotEditTrash) {
			return state.map((screenshot) => {
				if (payload.ids.includes(screenshot.id))
					return { ...screenshot, trash: payload.trash }
				return screenshot
			})
		}
	},
	effects: (dispatch) => ({
		delete({ ids, onSuccess, onFail }: Noonly.Effect.ScreenshotDelete) {
			const formData: Noonly.API.Request.ScreenshotDelete = { ids }
			post('/screenshots/delete', formData).then((res: Noonly.API.Response.ScreenshotDelete) => {
				dispatch.screenshots._delete(res.data.deleted)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		editFavorite({ ids, favorite, onSuccess, onFail, _redo }: Noonly.Effect.ScreenshotEditFavorite) {
			const formData: Noonly.API.Request.ScreenshotEditFavorite = { ids, favorite }
			post('/screenshots/editFavorite', formData).then((res: Noonly.API.Response.ScreenshotEditFavorite) => {
				dispatch.screenshots._editFavorite(res.data.updated)
				typeof onSuccess === 'function' && onSuccess()
				toast.show({
					id: `screenshotEditFavorite${ids[0]}`,
					description: res.message,
					action: _redo ? 'Redo' : 'Undo',
					onClick: () => dispatch.screenshots.editFavorite({ ids, favorite: !favorite, _redo: !_redo })
				})
			}).catch((error) => {
				toast.showError(error.message)
				typeof onFail === 'function' && onFail()
			})
		},
		editTrash({ ids, trash, _redo }: Noonly.Effect.ScreenshotEditTrash) {
			/* Update store before making the request */
			const predictedResponse = { ids, trash }
			dispatch.screenshots._editTrash(predictedResponse)

			toast.show({
				id: `screenshotEditTrash${ids[0]}`,
				description: trash
					? 'Moved Screenshot to Trash'
					: 'Restored Screenshot',
				action: _redo ? 'Redo' : 'Undo',
				onClick: () => dispatch.screenshots.editTrash({ ids, trash: !trash, _redo: !_redo })
			})

			const formData: Noonly.API.Request.ScreenshotEditTrash = { ids, trash }
			post('/screenshots/editTrash', formData).then((res: Noonly.API.Response.ScreenshotEditTrash) => {
				// Hmmm..
			}).catch((error) => {
				toast.showError(error.message)
			})
		},
		clearTrash({ onSuccess, onFail }: Noonly.Effect.ScreenshotClearTrash) {
			post('/screenshots/clearTrash').then((res: Noonly.API.Response.ScreenshotClearTrash) => {
				dispatch.screenshots._delete(res.data.deleted)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		}
	})
})

export default screenshots