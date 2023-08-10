import devBuild from 'library/utilities/devBuild'
import storage from 'library/utilities/storage'
import Axios from 'axios'

const port = devBuild ? '98' : '97'
const axiosInstance = Axios.create({
	baseURL: `https://aspire.icu:${port}`,
	headers: {
		'Content-Type': 'application/json'
	}
})

axiosInstance.interceptors.request.use((config) => {
	config.headers.token = storage.getItem('user').token
	return config
})

export default axiosInstance