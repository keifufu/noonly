export default {
	state: {
		accounts: {
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
		setAccounts(state, payload) {
			return {
				...state,
				accounts: payload
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