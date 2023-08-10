import { ApiResponse, ApisauceInstance } from 'apisauce'

import encrypt from 'utils/encrypt'
import getHeaders from 'api/getHeaders'
import makeGetCsrfToken from './getCsrfToken'

export interface RegisterBody {
	username: string
	password: string
	acceptedTerms: boolean
	recoveryCode: string
}

const makeRegister = (api: ApisauceInstance) => (body: RegisterBody): Promise<Noonly.User> => new Promise((resolve, reject) => {
	const getCsrfToken = makeGetCsrfToken(api)
	encrypt(body.password, body.password).then((encryptedPassword) => {
		encrypt(body.password, body.recoveryCode).then((passwordEncryptedWithRecoveryCode) => {
			const actualBody = {
				username: body.username,
				password: encryptedPassword,
				passwordEncryptedWithRecoveryCode,
				acceptedTerms: body.acceptedTerms
			}

			getCsrfToken().then((csrfToken) => {
				api.post('/authentication/register', actualBody, { headers: getHeaders(csrfToken) }).then((res: ApiResponse<any>) => {
					if (res.status !== 201 || !res.ok)
						return reject(res.data.error || 'Something went wrong')
					const sessionId = res.headers?.['session-id']
					const user: Noonly.User = {
						...res.data,
						currentSessionId: sessionId
					}
					return resolve(user)
				}).catch((error) => reject(error))
			}).catch(() => reject('Something went wrong'))
		}).catch(() => reject('Something went wrong'))
	}).catch(() => reject('Something went wrong'))
})

export default makeRegister