import { ApiResponse, ApisauceInstance } from 'apisauce'

import getHeaders from 'api/getHeaders'
import makeGetCsrfToken from './getCsrfToken'

export interface RefreshBody {
	user?: boolean
}

const makeRefresh = (api: ApisauceInstance) => (body?: RefreshBody): Promise<Noonly.User | null> => new Promise((resolve, reject) => {
	const getCsrfToken = makeGetCsrfToken(api)
	getCsrfToken().then((csrfToken) => {
		api.get(`/authentication/refresh?user=${body?.user}`, {}, { headers: getHeaders(csrfToken) }).then((res: ApiResponse<any>) => {
			if (res.status !== 200 || !res.ok)
				return reject(null)
			// If user has 2FA enabled and still needs to authenticate with it
			if (!res.data)
				return reject()
			const sessionId = res.headers?.['session-id']
			const user: Noonly.User = {
				...res.data,
				currentSessionId: sessionId
			}
			return resolve(res.data ? user : null)
		}).catch(() => reject('Something went wrong'))
	}).catch(() => reject('Something went wrong'))
})

export default makeRefresh