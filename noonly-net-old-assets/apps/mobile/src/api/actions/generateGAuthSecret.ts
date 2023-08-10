import { ApiResponse, ApisauceInstance } from 'apisauce'

import getHeaders from 'api/getHeaders'
import makeGetCsrfToken from './getCsrfToken'

const makeGenerateGAuthSecret = (api: ApisauceInstance) => (): Promise<string> => new Promise((resolve, reject) => {
	const getCsrfToken = makeGetCsrfToken(api)
	getCsrfToken().then((csrfToken) => {
		api.post('/2fa/generateGAuthSecret?setupKey=true', {}, { headers: getHeaders(csrfToken) }).then((res: ApiResponse<any>) => {
			if (res.status !== 201 || !res.ok)
				return reject(res.data.error || 'Something went wrong')
			return resolve(res.data.setupKey)
		}).catch(() => reject('Something went wrong'))
	}).catch(() => reject('Something went wrong'))
})

export default makeGenerateGAuthSecret