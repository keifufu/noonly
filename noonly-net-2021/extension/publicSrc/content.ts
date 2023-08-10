/// <reference types='chrome'/>

/* Insert version into page */
const manifest = chrome.runtime.getManifest()
const VERSION = manifest.version
document.querySelectorAll('#noonly-extension-version').forEach((el) => el.remove())
const el = document.createElement('div')
el.style.display = 'none'
el.id = 'noonly-extension-version'
el.textContent = VERSION
document.body.append(el)

interface ArrayInputType {
	type: string,
	field: HTMLInputElement
}

interface LoginFieldsForm {
	username?: HTMLInputElement,
	email?: HTMLInputElement,
	password?: HTMLInputElement,
  mfa?: HTMLInputElement
}

interface Account {
	id: string,
	icon: string,
	site: string,
	username: string,
	address: string,
	password: string,
	trash: boolean,
  mfaSecret: string | null
  createdAt: string
}

let accounts: Account[] = []
let aliases: {[key: string]: string[]} = {}

async function onLoadContent() {
	/* Fetch accounts on creation */
	accounts = await sendMessage({ event: 'FETCH_ACCOUNTS' })

	/* Fetch aliases on creation */
	aliases = await sendMessage({ event: 'FETCH_ALIASES' })
}
onLoadContent()

class PageUtils {
	getAccountsForCurrentSite(accounts: Account[]): Account[] {
		/* Example: Converts chan.sankakucomplex.com into sankakucomplex.com */
		const host = document.location.host.toLowerCase()
		const site = host.split('.').slice(-2).join('.')

		return accounts.filter((account) => {
			let isValid = false
			const _s = account.site.toLowerCase()
			// If a subdomain is specified, like osu.ppy.sh, DON'T match it with ppy.sh and DON't search for aliases for ppy.sh

			if (_s === site || _s === host)
				isValid = true
			else if (aliases[_s] && (aliases[_s].includes(site) || aliases[_s].includes(host)))
				isValid = true

			return isValid
		})
	}

	isVisible(el: HTMLElement) {
		const style = getComputedStyle(el)
		if (style.display === 'none') return false
		if (style.visibility !== 'visible') return false
		if (Number(style.opacity) < 0.1) return false
		if (el.offsetWidth + el.offsetHeight + el.getBoundingClientRect().height + el.getBoundingClientRect().width === 0)
			return false
		const elCenter = {
			x: el.getBoundingClientRect().left + el.offsetWidth / 2,
			y: el.getBoundingClientRect().top + el.offsetHeight / 2
		}
		if (elCenter.x < 0) return false
		if (elCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false
		if (elCenter.y < 0) return false
		if (elCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false
		let pointContainer = document.elementFromPoint(elCenter.x, elCenter.y)
		// eslint-disable-next-line curly
		do {
			if (pointContainer === el || pointContainer?.id?.includes('noonly-autofill')) return true
		// eslint-disable-next-line no-cond-assign
		} while (pointContainer = (pointContainer?.parentNode as HTMLElement))
		return false
	}

	// eslint-disable-next-line no-undef
	getVisibleElements(NodeList: NodeListOf<HTMLElement> | HTMLCollectionOf<any>): HTMLInputElement[] {
		return Array.from(NodeList).filter((el: HTMLElement) => this.isVisible(el))
	}

	getParentForm(elem: Element) {
		while (elem?.parentNode) {
			if (elem.parentNode.nodeName.toLowerCase() === 'form')
				return elem.parentNode
			// eslint-disable-next-line no-param-reassign
			elem = elem?.parentNode as Element
		}
	}

	isMailField(field: HTMLInputElement) {
		const label = document.querySelector(`label[for="${field.getAttribute('name')}"`)
		return label?.innerHTML.includes('mail') || field.ariaLabel?.includes('mail') || field.type === 'email' ||
			(field.name?.includes('mail') && ['email', 'text'].includes(field.type)) || field.placeholder?.toLowerCase().includes('mail')
	}

	isUsernameField(field: HTMLInputElement) {
		const label = document.querySelector(`label[for="${field.getAttribute('name')}"`)
		return label?.innerHTML.includes('user') ||
			(field.type === 'text' && (field.autocomplete?.toLowerCase().includes('username') || field.name?.toLowerCase().includes('username')))
	}

	isMfaField(field: HTMLInputElement) {
		const label = document.querySelector(`label[for="${field.getAttribute('name')}"`)
		return label?.innerHTML.includes('otp') || field.autocomplete?.toLowerCase().includes('otp') || field.name?.toLowerCase().includes('otp') ||
      field.autocomplete?.toLowerCase().includes('one-time-code') || field.name?.toLowerCase().includes('one-time-code') ||
      field.placeholder?.toLowerCase().includes('otp') || field.id?.toLowerCase().includes('otp') || field.id?.toLowerCase().includes('authenticator') ||
      field.name?.toLowerCase().includes('authenticator') || field.name?.toLowerCase().includes('otc') || field.id?.toLowerCase().includes('otc') ||
      field.autocomplete?.toLowerCase().includes('otc') || field.placeholder?.toLowerCase().includes('authenticator') ||
      field.id?.toLowerCase().includes('twofactor') || field.name?.toLowerCase().includes('twofactor') ||
      // twitter
      field.getAttribute('data-testid')?.toLowerCase().includes('ocf')
	}

	_findLoginFields(_inputs: HTMLInputElement[]) {
		const inputs = _inputs.filter((e) => !e.name?.toLowerCase().includes('confirm') && !e.name?.toLowerCase().includes('signup'))
		const fields: LoginFieldsForm = {}

		for (let i = inputs.length - 1; i >= 0; i--) {
			const input = inputs[i]
			if (input.type === 'password') {
				if (!fields.password)
					fields.password = input
			} else if (this.isMailField(input)) {
				if (fields.password && !fields.email && !fields.username)
					fields.email = input
			/**
			 * Don't use `isUsernameField` here, this function only gets called if a password field was found,
			 * 	so we can assume that there must be a username or email field
			 */
			} else if (this.isMfaField(input)) {
				if (!fields.mfa)
					fields.mfa = input
			} else if (input.type === 'text') {
				if (fields.password && !fields.email && !fields.username)
					fields.username = input
			}
		}

		return fields
	}

	getLoginFields(): ArrayInputType[] | LoginFieldsForm {
		const pwFields = this.getVisibleElements(document.querySelectorAll('input[type="password"]'))

		/* This is for pages such as google or microsoft, which only show one field at a time... */
		if (pwFields.length === 0) {
			/* If we cant precisely find the login form, return all possible fields for individual autofill */
			const inputs = this.getVisibleElements(document.querySelectorAll('input'))
			const fields: { type: string, field: HTMLInputElement }[] = []

			for (let i = 0; i < inputs.length; i++) {
				const input = inputs[i]
				if (input.getAttribute('type') === 'password')
					fields.push({ type: 'password', field: input })
				else if (this.isMfaField(input))
					fields.push({ type: 'mfa', field: input })
				else if (this.isMailField(input))
					fields.push({ type: 'email', field: input })
				else if (this.isUsernameField(input))
					fields.push({ type: 'username', field: input })
			}

			return fields
		}

		const filteredPwFields = pwFields.filter((e) => !e.name?.toLowerCase().includes('confirm') && !e.name?.toLowerCase().includes('signup'))
		const form = this.getParentForm(filteredPwFields[filteredPwFields.length - 1])

		if (!form)
			return this._findLoginFields(this.getVisibleElements(document.getElementsByTagName('input')))

		return this._findLoginFields(this.getVisibleElements(form.querySelectorAll('input')))
	}

	isRegisterPage() {
		const pathname = location.pathname.toLowerCase()
		const hostname = location.hostname.toLowerCase()
		if (pathname.includes('login') || pathname.includes('signin')) return false
		if (hostname.includes('login') || hostname.includes('signin')) return false
		return pathname.includes('signup') || pathname.includes('register') ||
			hostname.includes('signup') || hostname.includes('register')
	}
}

class HtmlUtils {
	createOverlay(boundingRect: DOMRect, offsetWidth: number, accounts: Account[]) {
		const element = document.createElement('div')

		const accountArray = pageUtils.getAccountsForCurrentSite(accounts)
		if (accountArray.length === 0) return null

		const site = document.location.host.toLowerCase()
		const generateInnerHtml = (top: number, left: number, width: number) => `
			<div id="noonly-autofill-overlay" style="z-index: 999999999; position: fixed; top: ${top}px;
				left: ${left}px; max-height: 200px; width: ${width}px; background-color: #1A202C; line-height: normal;
				border-radius: 0.375rem; color: white; display: flex; flex-direction: column; user-select: none; font-family: Roboto"
			>
				<div id="noonly-autofill-content" style="display: flex; flex-direction: column; padding: 0.5rem; padding-bottom: 0px; overflow: hidden;">
					<div id="noonly-autofill-header" style="display: flex; flex-direction: row; width: 100%;">
						<img
							id="noonly-autofill-header-logo"
							style="height: 40px; margin-right: 0.5rem; padding-bottom: 0.1rem;"
							src="https://noonly.net/logo512.png"
						/>
						<div id="noonly-autofill-header-text" style="font-size: 18px; font-weight: 500; 
							align-self: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
							${site}
						</div>
					</div>
					<div id="noonly-autofill-list" style="display: flex; flex-direction: column;
						flex-shrink: 1; overflow-y: scroll; margin-bottom: 0.5rem; scrollbar-width: none;
						border-radius: 0.375rem;" class="noonly-list">
						${this.createAccountCard(accountArray)}
					</div>
				</div>
			</div>
		`

		const offset = 15
		const minWidth = 300
		const top = boundingRect.top - (200 + offset)
		element.innerHTML = generateInnerHtml(top, boundingRect.left, boundingRect.width)
		document.body.appendChild(element)
		const elementHeight = document.getElementById('noonly-autofill-overlay')?.clientHeight || 200
		const elementWidth = document.getElementById('noonly-autofill-overlay')?.clientWidth || boundingRect.width
		element.remove()
		let newTop = boundingRect.top - (elementHeight + offset)
		element.innerHTML = generateInnerHtml(newTop, boundingRect.left, boundingRect.width)
		if (newTop < offset) {
			newTop = boundingRect.bottom + 15
			element.innerHTML = generateInnerHtml(newTop, boundingRect.left, boundingRect.width)
		}
		if (elementWidth < minWidth) {
			const boundingRectLeftCenter = boundingRect.left + offsetWidth / 2
			let newLeft = boundingRectLeftCenter - minWidth / 2
			if (newLeft < offset)
				newLeft = offset
			element.innerHTML = generateInnerHtml(newTop, newLeft, minWidth)
		}

		return element
	}

	createAccountCard(accountArray: Account[]) {
		const sortedAccounts = accountArray.sort((a, b) => (a.site.toLowerCase() < b.site.toLowerCase() ? -1 : a.site.toLowerCase() > b.site.toLowerCase() ? 1 : 0))
		const accountCards = sortedAccounts.map((account, i) => {
			const iconUrl = account.icon ? `https://oldapi.noonly.net/icon/${account.icon}` : `https://oldapi.noonly.net/accounts/favicon?site=${account.site}`
			return (`
				<div id="noonly-autofill-card" account-id="${account.id}" style="display: flex; background-color: #2D3748;
					border-radius: 0.375rem; width: 100%; cursor: pointer; margin-top: ${i === 0 ? '0px' : '0.5rem'};
					transition: all linear 0.1s; flex-direction: row;" class="noonly-account-card" tabindex="1"
				>
					<div id="noonly-autofill-card-content" style="display: flex; flex-direction: row; padding: 0.5rem; align-items: center;">
						<img
							id="noonly-autofill-card-icon"
							style="border-radius: 0.75rem; height: 40px; width: 40px; margin-right: 1rem;"
							src="${iconUrl}"
						/>
						<div id="noonly-autofill-card-text-wrapper" style="display: flex; flex-direction: column; justify-content: center;">
							<div id="noonly-autofill-card-username" style="font-size: 16px; align-self: flex-start;">
								${account.username || account.site}
							</div>
							<div id="noonly-autofill-card-address" style="font-size: 14px; margin-top: ${account.address ? '2px' : '0px'};">
								${account.address}
							</div>
						</div>
					</div>
				</div>
			`)
		})

		return accountCards.join('')
	}
}

/* Send a message to sw.js */
function sendMessage(data: any): Promise<any> {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage(data, (res) => {
			resolve(res)
		})
	})
}

const pageUtils = new PageUtils()
const htmlUtils = new HtmlUtils()

/* Listen to pathname updates */
let lastPathname = window.location.pathname
setInterval(() => {
	if (window.location.pathname !== lastPathname)
		setupInputFields()
	lastPathname = window.location.pathname
}, 1000)

document.addEventListener('click', eventListener)
document.addEventListener('mousedown', eventListener)

const ignoreTheseFields: HTMLElement[] = []
function eventListener(e) {
	if ((e.target as HTMLElement).tagName === 'INPUT' && !ignoreTheseFields.includes(e.target as HTMLElement)) {
		ignoreTheseFields.push(e.target as HTMLElement)
		setupInputFields(e.target as HTMLElement)
	}
}

function setupInputFields(clickedField?: HTMLElement) {
	if (pageUtils.isRegisterPage()) return
	const loginFields = pageUtils.getLoginFields()

	let isValidField = false
	if (Array.isArray(loginFields)) {
		loginFields.forEach(({ field }) => {
			if (field === clickedField)
				isValidField = true
		})
	} else {
		Object.values(loginFields).forEach((field) => {
			if (field === clickedField)
				isValidField = true
		})
	}

	if (Array.isArray(loginFields)) {
		loginFields.forEach(({ type, field }) => {
			if (field === clickedField && isValidField)
				setupField(type, field, true)
			else
				setupField(type, field)
		})
	} else if (isValidField) {
		setupForm(loginFields, clickedField)
	} else {
		setupForm(loginFields)
	}
}

function setupForm(form: LoginFieldsForm, focusField?: HTMLElement) {
	Object.keys(form).forEach((key) => {
		let mousedown = false
		let allowOpenByClick = false
		const field: HTMLInputElement = form[key]

		const onCardClick = (account: Account) => {
			Object.keys(form).forEach(async (key) => {
				let autofillData = account[key === 'email' ? 'address' : key]
				if (key === 'email' && !account.address)
					autofillData = account.username
				if (key === 'username' && !account.username)
					autofillData = account.address
				if (key === 'password')
					autofillData = await sendMessage({ event: 'DECRYPT', payload: account.password })
				if (key === 'mfa' && account.mfaSecret !== null)
					autofillData = await sendMessage({ event: 'GET_MFA_CODE', payload: account.mfaSecret })

				if (!autofillData) return

				const field = form[key]
				field.blur()
				field.value = autofillData
				/* We dispatch both events because some websites only work with either of them */
				field.dispatchEvent(new Event('input', { bubbles: true }))
				field.dispatchEvent(new Event('change', { bubbles: true }))
				document.querySelectorAll('#noonly-autofill-overlay').forEach((el) => el.remove())
			})
		}

		const onOpen = () => {
			mousedown = false
			allowOpenByClick = false
			onOverlayOpen(field, onCardClick)
		}

		if (field === focusField && field.value.length === 0)
			onOpen()
		field.onfocus = () => {
			if (!mousedown) {
				allowOpenByClick = true
				return
			}
			if (field.value.length > 0) return
			onOpen()
		}
		field.onmousedown = () => {
			mousedown = true
			if (field.value.length > 0) return
			if (allowOpenByClick) onOpen()
		}
	})
}

function setupField(type: string, field: HTMLInputElement, focusInstantly = false) {
	let mousedown = false
	let allowOpenByClick = false

	const onCardClick = async (account: Account) => {
		let autofillData = account[type === 'email' ? 'address' : type]
		if (type === 'email' && !account.address)
			autofillData = account.username
		if (type === 'username' && !account.username)
			autofillData = account.address
		if (type === 'password')
			autofillData = await sendMessage({ event: 'DECRYPT', payload: account.password })
		if (type === 'mfa' && account.mfaSecret !== null)
			autofillData = await sendMessage({ event: 'GET_MFA_CODE', payload: account.mfaSecret })

		if (!autofillData) return

		field.blur()
		field.value = autofillData
		/* We dispatch both events because some websites only work with either of them */
		field.dispatchEvent(new Event('input', { bubbles: true }))
		field.dispatchEvent(new Event('change', { bubbles: true }))
		document.querySelectorAll('#noonly-autofill-overlay').forEach((el) => el.remove())
	}

	const onOpen = () => {
		mousedown = false
		allowOpenByClick = false
		onOverlayOpen(field, onCardClick)
	}

	if (focusInstantly && field.value.length === 0)
		onOpen()
	field.onfocus = () => {
		if (!mousedown) {
			allowOpenByClick = true
			return
		}
		if (field.value.length > 0) return
		onOpen()
	}
	field.onmousedown = () => {
		mousedown = true
		if (field.value.length > 0) return
		if (allowOpenByClick) onOpen()
	}
}

async function onOverlayOpen(field: HTMLElement, onCardClick: (account: Account) => void) {
	accounts = await sendMessage({ event: 'FETCH_ACCOUNTS' })
	if (!accounts) return

	document.querySelectorAll('#noonly-autofill-overlay').forEach((el) => el.remove())
	const boundingRect = field.getBoundingClientRect()
	const overlay = htmlUtils.createOverlay(boundingRect, field.offsetWidth, accounts)
	if (!overlay) return
	document.body.appendChild(overlay)

	/* Hide keyboard */
	const isMobile = window.innerWidth <= 768
	if (isMobile)
		field.blur()

	registerCSPListeners()

	/* Setup listeners for closing overlay */
	setTimeout(() => {
		/* Close overlay on click-away */
		document.body.onmousedown = (e) => {
			if (!(e.target as HTMLElement).id?.includes('noonly-autofill'))
				overlay.remove()
		}
		/* Close overlay on Tab and Escape */
		document.body.onkeydown = (e) => {
			if (e.key === 'Tab' || e.key === 'Escape')
				overlay.remove()
		}
	})

	document.querySelectorAll('#noonly-autofill-card').forEach((card) => {
		card.addEventListener('click', () => {
			const accountId = card.getAttribute('account-id')
			const account = accounts.find((account) => account.id === accountId)
			if (!account) return
			onCardClick(account)
		})
	})
}

function registerCSPListeners() {
	const logo = document.getElementById('noonly-autofill-header-logo')
	if (logo) {
		logo.onerror = async (e: any) => {
			const base64 = await sendMessage({ event: 'FETCH_ICON', payload: e.target.src })
			if (!base64) return
			logo.setAttribute('src', base64)
		}
	}
	const icons = document.querySelectorAll('#noonly-autofill-card-icon')
	icons.forEach((icon) => {
		if (!icon) return
		(icon as HTMLImageElement).onerror = async (e: any) => {
			const base64 = await sendMessage({ event: 'FETCH_ICON', payload: e.target.src })
			if (!base64) return
			icon.setAttribute('src', base64)
		}
	})
}