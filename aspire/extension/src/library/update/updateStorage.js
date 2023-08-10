import encrypt from 'library/utilities/encrypt'
import storage from 'library/utilities/storage'

/**
 * This function will update breaking localStorage changes without having the user re-login
 * By adding a version to localStorage items we will be able to apply the required changes
 */

function updateStorage() {
	let user = storage.getItem('user', null)
	if (user) {
		if (!user.version) {
			user = {
				...user,
				password: encrypt(user.password, user.username),
				version: 0.1
			}
		}
		storage.setItem('user', user)
	}
}

export default updateStorage