import { UserDocument } from '@main/database/models/User.model'

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

const getLimitsByUser = (user: UserDocument): UserLimits => limits[user.level]

export default getLimitsByUser