interface UserLimits {
	icons: number,
	addresses: number
}

const limits: { [level: number]: UserLimits } = {
	0: {
		icons: 25,
		addresses: 10
	},
	1: {
		icons: 100,
		addresses: 25
	}
}

const getLimitsByUser = (user: Noonly.API.Data.User): UserLimits => limits[user.level || 0]

export default getLimitsByUser