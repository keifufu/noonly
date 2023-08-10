function makeError() {
	return new DOMException('The request is not allowed', 'NotAllowedError')
}

function copyClipboardApi(text) {
	if (!navigator.clipboard)
		makeError()
	return navigator.clipboard.writeText(text)
}

function copyExecCommand(text) {
	const span = document.createElement('span')
	span.textContent = text
	span.style.whiteSpace = 'pre'
	span.style.userSelect = 'all'

	document.body.appendChild(span)

	const selection = window.getSelection()
	const range = window.document.createRange()
	selection.removeAllRanges()
	range.selectNode(span)
	selection.addRange(range)

	let success = false
	try {
		success = window.document.execCommand('copy')
	} finally {
		selection.removeAllRanges()
		window.document.body.removeChild(span)
	}

	if (!success) throw makeError()
}

async function copy(text) {
	try {
		await copyClipboardApi(text)
	} catch (err) {
		try {
			await copyExecCommand(text)
		} catch (err2) {
			throw (err2 || err || makeError())
		}
	}
}

export default copy