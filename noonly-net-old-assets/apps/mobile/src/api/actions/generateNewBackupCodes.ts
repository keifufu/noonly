import { ApiResponse, ApisauceInstance } from 'apisauce'

import getHeaders from 'api/getHeaders'
import makeGetCsrfToken from './getCsrfToken'

export interface GenerateNewBackupCodesBody {
	password: string
}

export type GenerateNewBackupCodesReturnValue = string[]

const makeGenerateNewBackupCodes = (api: ApisauceInstance) => (body: GenerateNewBackupCodesBody): Promise<GenerateNewBackupCodesReturnValue> => new Promise((resolve, reject) => {
	const getCsrfToken = makeGetCsrfToken(api)
	getCsrfToken().then((csrfToken) => {
		api.post('/2fa/generateNewBackupCodes', body, { headers: getHeaders(csrfToken) }).then((res: ApiResponse<any>) => {
			if (res.status !== 200 || !res.ok)
				return reject(res.data.error || 'Something went wrong')
			return resolve(res.data)
		}).catch(() => reject('Something went wrong'))
	}).catch(() => reject('Something went wrong'))
})

export default makeGenerateNewBackupCodes