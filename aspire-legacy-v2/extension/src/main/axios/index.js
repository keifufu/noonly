import storage from 'library/utilities/storage'
import apiHost from 'library/utilities/apiHost'
import Axios from 'axios'

const axiosInstance = Axios.create({
	baseURL: apiHost,
	headers: {
		'Content-Type': 'application/json'
	}
})

axiosInstance.interceptors.request.use((config) => {
	config.headers.token = storage.getItem('user').token
	return config
})

export default axiosInstance