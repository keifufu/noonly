import Axios from 'axios'
import axiosInstance from 'main/axios'
import devBuild from 'library/utilities/devBuild'

const post = (path: string, formData: any = {}, options: any = {}): Promise<any> => {
	if (devBuild)
		console.log('[POST]', path, formData)

	return new Promise((resolve, reject) => {
		const source = Axios.CancelToken.source()
		const cancelToken = source.token
		const _options = {
			...options,
			cancelToken: cancelToken
		}

		axiosInstance.post(path, formData, _options).then(({ data }) => {
			if (devBuild)
				console.log(path, data)

			resolve(data)
		}).catch((error) => {
			if (devBuild)
				console.log(path, { message: error.response?.data?.error })

			if (error.response?.status === 400)
				reject({ message: error.response.data.error })
			else
				reject({ message: 'Something went wrong' })
		})
	})
}

export default post