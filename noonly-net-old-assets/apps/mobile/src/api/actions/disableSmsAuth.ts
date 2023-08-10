import { ApiResponse, ApisauceInstance } from 'apisauce'

import getHeaders from 'api/getHeaders'
import makeGetCsrfToken from './getCsrfToken'

export interface DisableSmsAuthBody {
	password: string
}

const makeDisableSmsAuth = (api: ApisauceInstance) => (body: DisableSmsAuthBody): Promise<void> => new Promise((resolve, reject) => {
	const getCsrfToken = makeGetCsrfToken(api)
	getCsrfToken().then((csrfToken) => {
		api.post('/2fa/disableSmsAuth', body, { headers: getHeaders(csrfToken) }).then((res: ApiResponse<any>) => {
			if (res.status !== 200 || !res.ok)
				return reject(res.data.error || 'Something went wrong')
			return resolve()
		}).catch(() => reject('Something went wrong'))
	}).catch(() => reject('Something went wrong'))
})

export default makeDisableSmsAuth