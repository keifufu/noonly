const { encrypt } = require('./Utilities')
const axios = require('axios')
const host = 'https://aspire.icu:97'

module.exports = {
	auth: {
		login({ username, password }) {
			return new Promise((resolve, reject) => {
				axios.post(`${host}/auth/login`, { username, password: encrypt(password, password) }).then(({ data }) => {
					data.res ? resolve(data.payload) : reject(data.payload)
				}).catch(() => reject('Something went wrong'))
			})
		},
		register({ username, password }) {
			return new Promise((resolve, reject) => {
				const encrypted = encrypt(password, password)
				axios.post(`${host}/auth/register`, { username, password: encrypted }).then(({ data }) => {
					data.res ? resolve(data.payload) : reject(data.payload)
				}).catch(() => reject('Something went wrong'))
			})
		}
	},
	passwords: {
		fetch() {
			return new Promise((resolve, reject) => {
				const pw_token = JSON.parse(localStorage.getItem('user')).pw_token
				axios.post(`${host}/passwords/fetch`, { pw_token }).then(({ data }) => {
					data.res ? resolve(data.payload) : reject(data.payload)
				}).catch(() => reject('Something went wrong'))
			})
		},
		create({ site, username, email, password }) {
			return new Promise((resolve, reject) => {
				const pw_token = JSON.parse(localStorage.getItem('user')).pw_token
				const encrypted = encrypt(password, JSON.parse(localStorage.getItem('user')).password) 
				axios.post(`${host}/passwords/create`, { pw_token, site, username, email, password: encrypted }).then(({ data }) => {
					data.res ? resolve(data.payload) : reject(data.payload)
				}).catch(() => reject('Something went wrong'))
			})
		},
		update({ id, site, username, email, password }) {
			return new Promise((resolve, reject) => {
				const pw_token = JSON.parse(localStorage.getItem('user')).pw_token
				const encrypted = encrypt(password, JSON.parse(localStorage.getItem('user')).password) 
				axios.post(`${host}/passwords/update`, { pw_token, id, site, username, email, password: encrypted }).then(({ data }) => {
					data.res ? resolve(data.payload) : reject(data.payload)
				}).catch(() => reject('Something went wrong'))
			})
		},
		setTrash({ id }, trash) {
			return new Promise((resolve, reject) => {
				const pw_token = JSON.parse(localStorage.getItem('user')).pw_token
				axios.post(`${host}/passwords/setTrash`, { pw_token, id, trash }).then(({ data }) => {
					data.res ? resolve(data.payload) : reject(data.payload)
				}).catch(() => reject('Something went wrong'))
			})
		},
		delete({ id }) {
			return new Promise((resolve, reject) => {
				const pw_token = JSON.parse(localStorage.getItem('user')).pw_token
				axios.post(`${host}/passwords/delete`, { pw_token, id }).then(({ data }) => {
					data.res ? resolve(data.payload) : reject(data.payload)
				}).catch(() => reject('Something went wrong'))
			})
		},
		setIcon({ id }, image) {
			return new Promise((resolve, reject) => {
				const pw_token = JSON.parse(localStorage.getItem('user')).pw_token
				axios.post(`${host}/passwords/setIcon`, { pw_token, id, image }).then(({ data }) => {
					data.res ? resolve(data.payload) : reject(data.payload)
				}).catch(() => reject('Something went wrong'))
			})
		},
		removeIcon({ id }) {
			return new Promise((resolve, reject) => {
				const pw_token = JSON.parse(localStorage.getItem('user')).pw_token
				axios.post(`${host}/passwords/removeIcon`, { pw_token, id }).then(({ data }) => {
					data.res ? resolve(data.payload) : reject(data.payload)
				}).catch(() => reject('Something went wrong'))
			})
		},
		setNote({ id, note }) {
			return new Promise((resolve, reject) => {
				const pw_token = JSON.parse(localStorage.getItem('user')).pw_token
				const encrypted = encrypt(note, JSON.parse(localStorage.getItem('user')).password)
				axios.post(`${host}/passwords/setNote`, { pw_token, id, note: encrypted }).then(({ data }) => {
					data.res ? resolve(data.payload) : reject(data.payload)
				}).catch(() => reject('Something went wrong'))
			})
		}
	}
}