import Axios from 'axios'
import apiHost from 'library/utilities/apiHost'
import socket from 'main/socket'
import storage from 'library/utilities/storage'

const axiosInstance = Axios.create({
	baseURL: apiHost,
	headers: {
		'Content-Type': 'application/json'
	}
})

axiosInstance.interceptors.request.use((config) => {
	config.headers.Authorization = storage.jwtToken
	config.headers.socketid = socket?.getId()
	return config
})

export default axiosInstance