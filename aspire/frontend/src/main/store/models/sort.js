export default {
	state: {
		passwords: {
			by: 'Name',
			direction: 'Down'
		},
		screenshots: {
			by: 'Date',
			direction: 'Down'
		},
		mail: {
			by: 'Date',
			direction: 'Down'
		},
		cloud: {
			by: 'Name',
			direction: 'Down'
		}
	},
	reducers: {
		setPasswords(state, payload) {
			return {
				...state,
				passwords: payload
			}
		},
		setScreenshots(state, payload) {
			return {
				...state,
				screenshots: payload
			}
		},
		setMail(state, payload) {
			return {
				...state,
				mail: payload
			}
		},
		setCloud(state, payload) {
			return {
				...state,
				cloud: payload
			}
		}
	}
}