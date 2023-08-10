/* eslint-disable max-len */
/* eslint-disable no-undef */
let passwordJson = null

checkForUpdates()
setInterval(checkForUpdates, 1000)

function checkForUpdates() {
	chrome.runtime.sendMessage({ method: 'getPasswords' }, (res) => {
		if (passwordJson === res.passwords) return
		passwordJson = res.passwords
		createContextMenus()
	})
}

function createContextMenus() {
	/* Example: Converts chan.sankakucomplex.com into sankakucomplex.com */
	const host = document.location.host.toLowerCase()
	const hostSplit = host.split('.')
	if (hostSplit.length > 2) hostSplit.shift()
	const site = hostSplit.join('.')

	chrome.runtime.sendMessage({ method: 'removeAllContextMenus' })

	const passwords = JSON.parse(passwordJson)
	const sitePasswords = Object.values(passwords).filter((e) => !e.trash).filter((e) => e.site.toLowerCase().includes(site))

	const contextMenu = { title: 'Accounts', contexts: ['editable'], id: 'noonly-accounts' }
	chrome.runtime.sendMessage({ method: 'createContextMenu', payload: JSON.stringify(contextMenu) })

	if (sitePasswords.length === 1) {
		const [item] = sitePasswords

		if (item.username.length > 0) {
			const contextMenuUsername = { title: 'Username', contexts: ['editable'], parentId: 'noonly-accounts' }
			chrome.runtime.sendMessage({
				method: 'createContextMenu',
				payload: JSON.stringify(contextMenuUsername),
				clicky: true,
				type: 'username',
				item: JSON.stringify(item)
			})
		}

		if (item.email.length > 0) {
			const contextMenuEmail = { title: 'Email', contexts: ['editable'], parentId: 'noonly-accounts' }
			chrome.runtime.sendMessage({
				method: 'createContextMenu',
				payload: JSON.stringify(contextMenuEmail),
				clicky: true,
				type: 'email',
				item: JSON.stringify(item)
			})
		}

		const contextMenuPassword = { title: 'Password', contexts: ['editable'], parentId: 'noonly-accounts' }
		chrome.runtime.sendMessage({
			method: 'createContextMenu',
			payload: JSON.stringify(contextMenuPassword),
			clicky: true,
			type: 'password',
			item: JSON.stringify(item)
		})
	} else {
		sitePasswords.forEach((item) => {
			const contextMenu = { title: item.username ? item.username : item.email ? item.email : 'No Username or Email', contexts: ['editable'], id: `noonly-${site}-${item.id}`, parentId: 'noonly-accounts' }
			chrome.runtime.sendMessage({
				method: 'createContextMenu',
				payload: JSON.stringify(contextMenu)
			})

			if (item.username.length > 0) {
				const contextMenuUsername = { title: 'Username', contexts: ['editable'], parentId: `noonly-${site}-${item.id}` }
				chrome.runtime.sendMessage({
					method: 'createContextMenu',
					payload: JSON.stringify(contextMenuUsername),
					clicky: true,
					type: 'username',
					item: JSON.stringify(item)
				})
			}

			if (item.email.length > 0) {
				const contextMenuEmail = { title: 'Email', contexts: ['editable'], parentId: `noonly-${site}-${item.id}` }
				chrome.runtime.sendMessage({
					method: 'createContextMenu',
					payload: JSON.stringify(contextMenuEmail),
					clicky: true,
					type: 'email',
					item: JSON.stringify(item)
				})
			}

			const contextMenuPassword = { title: 'Password', contexts: ['editable'], parentId: `noonly-${site}-${item.id}` }
			chrome.runtime.sendMessage({
				method: 'createContextMenu',
				payload: JSON.stringify(contextMenuPassword),
				clicky: true,
				type: 'password',
				item: JSON.stringify(item)
			})
		})
	}
}

let lastTargetEl = null
document.addEventListener('contextmenu', (e) => (lastTargetEl = e.target), true)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.method === 'createContextMenus')
		createContextMenus()
	if (request.method === 'insert') {
		const toInsert = request.payload

		const event = new Event('input', {
			bubbles: true,
			cancelable: true
		})

		lastTargetEl.value = toInsert
		lastTargetEl.dispatchEvent(event)
	}
})