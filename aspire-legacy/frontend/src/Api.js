const { encrypt, devBuild } = require('./Utilities')
const axios = require('axios')

// const port = devBuild ? '98' : '97'
const port = '97'
const API = axios.create({ baseURL: `https://aspire.icu:${port}` })
API.interceptors.request.use(req => {
	if(localStorage.getItem('user')) {
		req.headers.token = JSON.parse(localStorage.getItem('user')).token
	}
	return req
})

function genericPost(path, formData = {}, options = {}) {
	return new Promise((resolve, reject) => {
		API.post(path, formData, options).then(({ data }) => {
			data.res ? resolve(data.payload) : reject(data.payload)
		}).catch(() => reject('Something went wrong'))
	})
}

module.exports = {
	auth: {
		login({ username, password }) {
			const formData = { username, password: encrypt(password, password) }
			return genericPost('/auth/login', formData)
		},
		register({ username, password }) {
			const formData = { username, password: encrypt(password, password) }
			return genericPost('/auth/register', formData)
		}
	},
	cloud: {
		fetch({ location, path }) {
			const formData = { location, path }
			return genericPost('/cloud/fetch', formData)
		},
		tree() {
			return genericPost('/cloud/tree')
		},
		restore({ path }) {
			const formData = { path }
			return genericPost('/cloud/restore', formData)
		},
		rename({ location, path, newLocation, newPath, overwrite, append }) {
			const formData = { location, path, newLocation, newPath, overwrite, append }
			return genericPost('/cloud/rename', formData)
		},
		renameMultiple(items) {
			const formData = { items: JSON.stringify(items) }
			return genericPost('/cloud/rename/multiple', formData)
		},
		copy({ location, path, newLocation, newPath, overwrite, append }) {
			const formData = { location, path, newLocation, newPath, overwrite, append }
			return genericPost('/cloud/copy', formData)
		},
		copyMultiple(items) {
			const formData = { items: JSON.stringify(items) }
			return genericPost('/cloud/copy/multiple', formData)
		},
		delete({ location, path }) {
			const formData = { location, path }
			return genericPost('/cloud/delete', formData)
		},
		deleteMultiple(items) {
			const formData = { items: JSON.stringify(items) }
			return genericPost('/cloud/delete/multiple', formData)
		},
		create({ location, path }) {
			const formData = { location, path }
			return genericPost('/cloud/create', formData)
		},
		createDownloadKey({ location, path }) {
			const formData = { location, path }
			return genericPost('/cloud/createDownloadKey', formData)
		},
		download({ location, path }, onDownloadProgress) {
			return new Promise((resolve, reject) => {
				const options = { responseType: 'blob', onDownloadProgress }
				API.get(`/cloud/download?location=${location}&path=${path}`, options).then(res => {
					return res.data.res === false ? reject(res.data.payload) : resolve(res)
				}).catch(() => reject('Something went wrong'))
			})
		},
		downloadMultiple(items, onDownloadProgress) {
			return new Promise((resolve, reject) => {
				const options = { responseType: 'blob', onDownloadProgress }
				API.get(`/cloud/download/multiple?items=${JSON.stringify(items)}`, options).then(res => {
					return res.data.res === false ? reject(res.data.payload) : resolve(res)
				}).catch(() => reject('Something went wrong'))
			})
		},
		upload(formData, onUploadProgress) {
			const options = { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress }
			return genericPost('/cloud/upload', formData, options)
		},
		getTextFile({ location, path }) {
			const formData = { location, path }
			return genericPost('/cloud/getTextFile', formData)
		},
		saveTextFile({ location, path, text }) {
			const formData = { location, path, text }
			return genericPost('/cloud/saveTextFile', formData)
		},
		getImageData({ location, path }) {
			const formData = { location, path }
			return genericPost('/cloud/getImageData', formData)
		},
		clearTrash() {
			return genericPost('/cloud/clearTrash')
		}
	},
	inbox: {
		fetch() {
			return genericPost('/inbox/fetch')
		},
		getImageAttachments(item) {
			const formData = { item: JSON.stringify(item) }
			return genericPost('/inbox/getImageAttachments', formData)
		},
		setFavorite(items, favorite) {
			const formData = { items: JSON.stringify(items), favorite }
			return genericPost('/inbox/setFavorite', formData)
		},
		setRead(items, read) {
			const formData = { items: JSON.stringify(items), read }
			return genericPost('/inbox/setRead', formData)
		},
		setLocation(items, location) {
			const formData = { items: JSON.stringify(items), location }
			return genericPost('/inbox/setLocation', formData)
		},
		send(mail) {
			const formData = { mail: JSON.stringify(mail) }
			return genericPost('/inbox/send', formData)
		},
		delete(items) {
			const formData = { items: JSON.stringify(items) }
			return genericPost('/inbox/delete', formData)
		},
		download(items) {
			return new Promise((resolve, reject) => {
				const options = { responseType: 'blob' }
				API.get(`/inbox/download?items=${JSON.stringify(items.map(e => ({ aspire_id: e.aspire_id })))}`, options).then(res => {
					return res.data.res === false ? reject(res.data.payload) : resolve(res)
				}).catch(() => reject('Something went wrong'))
			})
		}
	},
	passwords: {
		fetch() {
			return genericPost('/passwords/fetch')
		},
		create({ site, username, email, password }) {
			const encrypted = encrypt(password, JSON.parse(localStorage.getItem('user')).password) 
			const formData = { site, username, email, password: encrypted }
			return genericPost('/passwords/create', formData)
		},
		update({ id, site, username, email, password }) {
			const encrypted = encrypt(password, JSON.parse(localStorage.getItem('user')).password) 
			const formData = { id, site, username, email, password: encrypted }
			return genericPost('/passwords/update', formData)
		},
		setTrash({ id }, trash) {
			const formData = { id, trash }
			return genericPost('/passwords/setTrash', formData)
		},
		delete({ id }) {
			const formData = { id }
			return genericPost('/passwords/delete', formData)
		},
		setIcon({ id }, image) {
			const formData = { id, image }
			return genericPost('/passwords/setIcon', formData)
		},
		removeIcon({ id }) {
			const formData = { id }
			return genericPost('/passwords/removeIcon', formData)
		},
		setNote({ id, note }) {
			const formData = { id, note }
			return genericPost('/passwords/setNote', formData)
		}
	},
	screenshots: {
		fetch() {
			return genericPost('/screenshots/fetch')
		},
		delete({ id }) {
			const formData = { id }
			return genericPost('/screenshots/delete', formData)
		},
		copyToCloud({ path, location, name }) {
			const formData = { path, location, name }
			return genericPost('/screenshots/copyToCloud', formData)
		},
		copyMultipleToCloud(items) {
			const formData = { items: JSON.stringify(items) }
			return genericPost('/screenshots/copyToCloud/multiple', formData)
		},
		setFavorite({ id }, favorite) {
			const formData = { id, favorite }
			return genericPost('/screenshots/setFavorite', formData)
		},
		download(url) {
			return new Promise((resolve, reject) => {
				axios.get(url, { responseType: 'blob' }).then(res => {
					resolve(res)
				}).catch(() => reject('Something went wrong'))
			})
		}
	},
	friends: {
		fetch() {
			return genericPost('/friends/fetch')
		},
		remove({ id }) {
			const formData = { id }
			return genericPost('/friends/remove', formData)
		},
		requests: {
			send(username) {
				const formData = { username }
				return genericPost('/friends/requests/send', formData)
			},
			cancel({ id }) {
				const formData = { id }
				return genericPost('/friends/requests/cancel', formData)
			},
			accept({ id }) {
				const formData = { id }
				return genericPost('/friends/requests/accept', formData)
			},
			deny({ id }) {
				const formData = { id }
				return genericPost('/friends/requests/deny', formData)
			}
		}
	},
	groups: {
		create(users) {
			const formData = { users }
			return genericPost('/groups/create', formData)
		}
	},
	metadata(url) {
		const formData = { url }
		return genericPost('/metadata', formData)
	}
}