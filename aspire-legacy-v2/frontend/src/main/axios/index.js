import storage from 'library/utilities/storage'
import apiHost from 'library/utilities/apiHost'
import socket from 'main/socket'
import Axios from 'axios'

const axiosInstance = Axios.create({
	baseURL: apiHost,
	headers: {
		'Content-Type': 'application/json'
	}
})

axiosInstance.interceptors.request.use((config) => {
	config.headers.Authorization = storage.jwt_token
	config.headers.socketid = socket.id
	return config
})

export default axiosInstance