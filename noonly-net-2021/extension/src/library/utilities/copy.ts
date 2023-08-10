const makeError = () => new DOMException('The request is not allowed', 'NotAllowedError')

const copyClipboardApi = (text: string) => {
	if (!navigator.clipboard)
		makeError()
	return navigator.clipboard.writeText(text)
}

const copyExecCommand = (text: string): void => {
	const span = document.createElement('span')
	span.textContent = text
	span.style.whiteSpace = 'pre'
	span.style.userSelect = 'all'

	document.body.appendChild(span)

	const selection = window.getSelection()
	const range = window.document.createRange()
	selection?.removeAllRanges()
	range.selectNode(span)
	selection?.addRange(range)

	let success = false
	try {
		success = window.document.execCommand('copy')
	} finally {
		selection?.removeAllRanges()
		window.document.body.removeChild(span)
	}

	if (!success) throw makeError()
}

const copy = async (text: string): Promise<void> => {
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