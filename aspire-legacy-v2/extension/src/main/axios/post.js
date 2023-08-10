import devBuild from 'library/utilities/devBuild'
import axiosInstance from 'main/axios'
import Axios from 'axios'

function post(path, formData = {}, options = {}) {
	if (devBuild)
		console.log('[POST]', path, formData)
	return new Promise((resolve, reject) => {
		const source = Axios.CancelToken.source()
		const cancelToken = source.token
		const _options = {
			...options,
			cancelToken: cancelToken,
			onUploadProgress: (e) => {
				if (options.onUploadProgress)
					options.onUploadProgress(e, () => source.cancel('Upload Cancelled by User'))
			}
		}
		axiosInstance.post(path, formData, _options).then(({ data }) => {
			if (devBuild)
				console.log(path, data)
			data.res ? resolve({ payload: data.payload, message: data.message }) : reject({ payload: data.payload, message: data.message })
		}).catch((err) => reject({
			message: err.message === 'Upload Cancelled by User' ? err.message : 'Something went wrong',
			payload: null
		}))
	})
}

export default post