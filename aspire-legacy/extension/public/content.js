init()
function init() {
	try {
	chrome.runtime.sendMessage({ method: 'removeAllContextMenus' })
	const site = document.location.host.toLowerCase().replace('www.', '')
	chrome.runtime.sendMessage({ method: 'getPasswords' }, res => {
		const passwords = JSON.parse(res.passwords)
		const sitePasswords = passwords.filter(e => site.includes(e.site.toLowerCase()))
		const contextMenu = { title: 'Accounts', contexts: ['editable'], id: 'aspire-accounts' }
		chrome.runtime.sendMessage({ method: 'createContextMenu', payload: JSON.stringify(contextMenu) })
		if(sitePasswords.length === 1) {
			const item = sitePasswords[0]

			const contextMenuUsername = { title: 'Username', contexts: ['editable'], parentId: 'aspire-accounts' }
			chrome.runtime.sendMessage({ method: 'createContextMenu', payload: JSON.stringify(contextMenuUsername), clicky: 'true', type: 'username', item: JSON.stringify(item) })

			if(item.email.length > 0) {
				const contextMenuEmail = { title: 'Email', contexts: ['editable'], parentId: 'aspire-accounts' }
				chrome.runtime.sendMessage({ method: 'createContextMenu', payload: JSON.stringify(contextMenuEmail), clicky: 'true', type: 'email', item: JSON.stringify(item) })
			}

			const contextMenuPassword = { title: 'Password', contexts: ['editable'], parentId: 'aspire-accounts' }
			chrome.runtime.sendMessage({ method: 'createContextMenu', payload: JSON.stringify(contextMenuPassword), clicky: 'true', type: 'password', item: JSON.stringify(item) })
		} else {
			sitePasswords.forEach(item => {
				const contextMenu = { title: item.username, contexts: ['editable'], id: `aspire-${site}-${item.username}`, parentId: 'aspire-accounts' }
				chrome.runtime.sendMessage({ method: 'createContextMenu', payload: JSON.stringify(contextMenu) })

				const contextMenuUsername = { title: 'Username', contexts: ['editable'], parentId: `aspire-${site}-${item.username}` }
				chrome.runtime.sendMessage({ method: 'createContextMenu', payload: JSON.stringify(contextMenuUsername), clicky: 'true', type: 'username', item: JSON.stringify(item) })

				if(item.email.length > 0) {
					const contextMenuEmail = { title: 'Email', contexts: ['editable'], parentId: `aspire-${site}-${item.username}` }
					chrome.runtime.sendMessage({ method: 'createContextMenu', payload: JSON.stringify(contextMenuEmail), clicky: 'true', type: 'email', item: JSON.stringify(item) })
				}

				const contextMenuPassword = { title: 'Password', contexts: ['editable'], parentId: `aspire-${site}-${item.username}` }
				chrome.runtime.sendMessage({ method: 'createContextMenu', payload: JSON.stringify(contextMenuPassword), clicky: 'true', type: 'password', item: JSON.stringify(item) })
				/* TODO: Decrypt password before inputting it into input */
			})
		}
	})
	} catch(e) { console.log(e) }
}

let clickedEl = null
document.addEventListener('contextmenu', e => { clickedEl = e.target }, true)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if(request.method === 'insert') {
		const insert = request.payload
		clickedEl.value = insert
	}
	if(request.method === 'init') init()
})