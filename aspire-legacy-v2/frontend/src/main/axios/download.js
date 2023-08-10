import axiosInstance from 'main/axios'
import Axios from 'axios'

function download(url, onDownloadProgress = (() => null)) {
	return new Promise((resolve, reject) => {
		const source = Axios.CancelToken.source()
		const cancelToken = source.token
		const options = {
			responseType: 'blob',
			cancelToken: cancelToken,
			onDownloadProgress: (e) => onDownloadProgress(e, () => source.cancel('Download Cancelled by User'))
		}
		axiosInstance.get(url, options).then(async (res) => {
			const text = await res.data.text()
			try {
				const json = JSON.parse(text)
				if (json.res === false)
					return reject(json)
			} catch (e) {
				null
			}

			resolve(res)
		}).catch((err) => reject(err))
	})
}

export default download