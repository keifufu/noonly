function insert(field, text) {
	const document = field.ownerDocument
	const initialFocus = document.activeElement
	if (initialFocus !== field) {
		field.focus()
	}

	document.execCommand('insertText', false, text)

	if (initialFocus === document.body) {
		field.blur()
	} else if (initialFocus instanceof HTMLElement && initialFocus !== field) {
		initialFocus.focus()
	}
}

function indent(element) {
	const {selectionStart, selectionEnd, value} = element
	const selectedText = value.slice(selectionStart, selectionEnd)
	const lineBreakCount = /\n/g.exec(selectedText)?.length

	if (lineBreakCount > 0) {
		const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1

		const newSelection = element.value.slice(firstLineStart, selectionEnd - 1)
		const indentedText = newSelection.replace(/^|\n/g, '$&\t')
		const replacementsCount = indentedText.length - newSelection.length

		element.setSelectionRange(firstLineStart, selectionEnd - 1)
		insert(element, indentedText)

		element.setSelectionRange(selectionStart + 1, selectionEnd + replacementsCount)
	} else {
		insert(element, '\t')
	}
}

function findLineEnd(value, currentEnd) {
	const lastLineStart = value.lastIndexOf('\n', currentEnd - 1) + 1

	if (value.charAt(lastLineStart) !== '\t') {
		return currentEnd
	}

	return lastLineStart + 1
}

function unindent(element) {
	const { selectionStart, selectionEnd, value } = element

	const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
	const minimumSelectionEnd = findLineEnd(value, selectionEnd)

	const newSelection = element.value.slice(firstLineStart, minimumSelectionEnd)
	const indentedText = newSelection.replace(/(^|\n)\t/g, '$1')
	const replacementsCount = newSelection.length - indentedText.length

	element.setSelectionRange(firstLineStart, minimumSelectionEnd)
	insert(element, indentedText)

	const wasTheFirstLineUnindented = value.slice(firstLineStart, selectionStart).includes('\t')
	const newSelectionStart = selectionStart - Number(wasTheFirstLineUnindented)
	element.setSelectionRange(
		selectionStart - Number(wasTheFirstLineUnindented),
		Math.max(newSelectionStart, selectionEnd - replacementsCount)
	)
}

function eventHandler(event) {
	if (event.defaultPrevented) return
	const textarea = event.target
	if (event.key === 'Tab' && !event.metaKey && !event.altKey && !event.ctrlKey) {
		if(event.shiftKey) {
			unindent(textarea)
		} else {
			indent(textarea)
		}

		event.preventDefault()
	}
}

export default function watch(elements) {
	if (typeof elements === 'string') {
		elements = document.querySelectorAll(elements)
	} else if(elements instanceof HTMLTextAreaElement) {
		elements = [elements]
	}

	for (const element of elements) {
		element.addEventListener('keydown', eventHandler)
	}
}