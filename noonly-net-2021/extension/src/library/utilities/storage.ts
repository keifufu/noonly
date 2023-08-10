import jwtDecode from 'jwt-decode'

type logoutFuncType = (val: boolean) => void
let logoutFunc: logoutFuncType | null = null
class Storage {
	get jwtToken(): string | null {
		return this.getItem('jwtToken', true, null)
	}

	get user() {
		if (!this.jwtToken) return null
		return jwtDecode(this.jwtToken)
	}

	getItem(name: string, noJson = false, returnIfEmpty: any = {}): any {
		try {
			return localStorage.getItem(name)
				? noJson
					? localStorage.getItem(name)
					: JSON.parse(this.getItem(name, true))
				: returnIfEmpty
		} catch (error) {
			return returnIfEmpty
		}
	}

	setItem(name: string, data: string | any) {
		if (window.chrome)
			chrome?.storage?.local?.set?.({ [name]: data })
		if (typeof data === 'string')
			localStorage.setItem(name, data)
		else
			localStorage.setItem(name, JSON.stringify(data))
	}

	removeItem(name: string) {
		if (window.chrome)
			chrome?.storage?.local?.remove?.(name)
		localStorage.removeItem(name)
	}

	logout() {
		if (!this.jwtToken) return
		this.removeItem('user')
		this.removeItem('accounts')
		this.removeItem('jwtToken')
		this.removeItem('encrypted_password')
		typeof logoutFunc === 'function'
			? logoutFunc(false)
			: window.location.reload()
	}
}

const storage = new Storage()
export const setLogoutFunction = (func: logoutFuncType): void => {
	logoutFunc = func
}

export default storage