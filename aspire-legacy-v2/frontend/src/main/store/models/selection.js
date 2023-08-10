import rfdc from 'rfdc'
const clone = rfdc()

export default {
	state: {
		screenshots: [],
		mail: [],
		cloud: []
	},
	reducers: {
		toggleScreenshotSelection(state, payload) {
			if (state.screenshots.includes(payload)) {
				const clonedScreenshots = clone(state.screenshots)
				return {
					...state,
					screenshots: clonedScreenshots.filter((e) => e !== payload)
				}
			} else {
				return {
					...state,
					screenshots: [
						...state.screenshots,
						payload
					]
				}
			}
		},
		setScreenshotSelection(state, payload) {
			return {
				...state,
				screenshots: payload
			}
		},
		toggleMailSelection(state, payload) {
			if (state.mail.includes(payload)) {
				const clonedMail = clone(state.mail)
				return {
					...state,
					mail: clonedMail.filter((e) => e !== payload)
				}
			} else {
				return {
					...state,
					mail: [
						...state.mail,
						payload
					]
				}
			}
		},
		setMailSelection(state, payload) {
			return {
				...state,
				mail: payload
			}
		},
		toggleCloudSelection(state, payload) {
			if (state.cloud.includes(payload)) {
				const clonedCloud = clone(state.cloud)
				return {
					...state,
					cloud: clonedCloud.filter((e) => e !== payload)
				}
			} else {
				return {
					...state,
					cloud: [
						...state.cloud,
						payload
					]
				}
			}
		},
		setCloudSelection(state, payload) {
			return {
				...state,
				cloud: payload
			}
		}
	}
}