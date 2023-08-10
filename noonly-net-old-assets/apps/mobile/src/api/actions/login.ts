import { ApiResponse, ApisauceInstance } from 'apisauce'

import encrypt from 'utils/encrypt'
import getHeaders from 'api/getHeaders'
import makeGetCsrfToken from './getCsrfToken'

export interface LoginBody {
	username: string
	password: string
}

export interface LoginReturnValue {
	user: Noonly.User | null,
	twoFAMethods: string[],
	twoFAEmail?: string
}

const makeLogin = (api: ApisauceInstance) => (body: LoginBody): Promise<LoginReturnValue> => new Promise((resolve, reject) => {
	const getCsrfToken = makeGetCsrfToken(api)
	encrypt(body.password, body.password).then((encryptedPassword) => {
		const actualBody = {
			username: body.username,
			password: encryptedPassword
		}

		getCsrfToken().then((csrfToken) => {
			api.post('/authentication/login', actualBody, { headers: getHeaders(csrfToken) }).then((res: ApiResponse<any>) => {
				if (res.status !== 200 || !res.ok)
					return reject(res.data.error || 'Something went wrong')
				// if res.data is empty, user has 2FA enabled
				const twoFAMethods = JSON.parse(res.headers?.['2fa-methods'] || '[]')
				const twoFAEmail = res.headers?.['2fa-email']
				if (!res.data)
					return resolve({ user: null, twoFAMethods, twoFAEmail })
				const sessionId = res.headers?.['session-id']
				const user: Noonly.User = {
					...res.data,
					currentSessionId: sessionId
				}
				return resolve({ user, twoFAMethods })
			}).catch((error) => reject(error))
		}).catch(() => reject('Something went wrong'))
	}).catch(() => reject('Something went wrong'))
})

export default makeLogin