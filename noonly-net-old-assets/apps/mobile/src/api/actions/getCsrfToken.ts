import { ApiResponse, ApisauceInstance } from 'apisauce'

const makeGetCsrfToken = (api: ApisauceInstance) => (): Promise<string> => new Promise((resolve, reject) => {
	api.get('/authentication/form').then((res: ApiResponse<any>) => {
		if (res.status !== 201 || !res.ok)
			return reject(res.data.error || 'Something went wrong')
		return resolve(res.data.csrfToken)
	}).catch(() => reject('Something went wrong'))
})

export default makeGetCsrfToken