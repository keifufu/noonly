import downloadFile from './downloadFile'
import { downloadZip } from 'client-zip'
import storage from 'library/utilities/storage'
import streamSaver from 'streamsaver'
import toast from 'library/utilities/toast'

interface Item {
	url: string,
	filename: string,
	method: 'POST' | 'GET',
	formData?: FormData
}

async function* activate(items: Item[]) {
	for (const item of items) {
		try {
			const response = await fetch(item.url, {
				headers: {
					Authorization: `${storage.jwtToken}`
				},
				method: item.method,
				body: item.formData
			})
			if (!response.ok || response.status === 400)
				toast.showError(`Something went wrong downloading '${item.url}'`)
			else if (response.status === 204 || response.headers.get('Content-Length') === '0' || !response.body)
				toast.showError(`Something went wrong downloading '${item.url}'`)
			else yield { name: item.filename, input: response }
		} catch (error) {
			toast.showError(`Something went wrong downloading '${item.url}'`)
			console.error(error)
		}
	}
}

const downloadMultipleFiles = (items: Item[], filename: string): void | Promise<void> => {
	if (items.length === 1)
		return downloadFile(items[0])

	const { body } = downloadZip(activate(items))
	const fileStream = streamSaver.createWriteStream(filename)
	body?.pipeTo(fileStream)
		.then(() => toast.show('Finished downloading'))
		.catch((error) => toast.showError(error))
}

export default downloadMultipleFiles