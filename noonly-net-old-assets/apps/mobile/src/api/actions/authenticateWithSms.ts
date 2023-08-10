import { ApiResponse, ApisauceInstance } from 'apisauce'

import getHeaders from 'api/getHeaders'
import makeGetCsrfToken from './getCsrfToken'

export interface AuthenticateWithSmsBody {
	twoFactorAuthenticationCode: string
}

const makeAuthenticateWithSms = (api: ApisauceInstance) => (body: AuthenticateWithSmsBody): Promise<Noonly.User> => new Promise((resolve, reject) => {
	const getCsrfToken = makeGetCsrfToken(api)
	getCsrfToken().then((csrfToken) => {
		api.post('/2fa/authenticateWithSms', body, { headers: getHeaders(csrfToken) }).then((res: ApiResponse<any>) => {
			if (res.status !== 200 || !res.ok)
				return reject(res.data.error || 'Something went wrong')
			const sessionId = res.headers?.['session-id']
			const user: Noonly.User = {
				...res.data,
				currentSessionId: sessionId
			}
			return resolve(user)
		}).catch(() => reject('Something went wrong'))
	}).catch(() => reject('Something went wrong'))
})

export default makeAuthenticateWithSms