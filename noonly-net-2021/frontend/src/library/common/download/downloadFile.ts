import { ReadableStream as ReadableStreamPolyfill, WritableStream as WritableStreamPolyfill } from 'web-streams-polyfill/ponyfill'
import { createReadableStreamWrapper, createWritableStreamWrapper } from '@mattiasbuelens/web-streams-adapter'

import storage from 'library/utilities/storage'
import streamSaver from './streamSaver'
import toast from 'library/utilities/toast'

const toPolyfillReadable = createReadableStreamWrapper(ReadableStreamPolyfill)
const toPolyfillWriteable = createWritableStreamWrapper(WritableStreamPolyfill)
streamSaver.WritableStream = WritableStreamPolyfill

interface IProps {
	url: string,
	filename: string,
	method: 'POST' | 'GET',
	body?: any
}

async function downloadFile({ url, filename, method, body }: IProps): Promise<void> {
	try {
		const fileStream = toPolyfillWriteable(streamSaver.createWriteStream(filename))
		const response = await fetch(url, {
			headers: {
				Authorization: `${storage.jwtToken}`,
				'Content-Type': 'application/json'
			},
			method: method,
			body
		})

		if (!response.ok || response.status === 400 || response.status === 204 || response.headers.get('Content-Length') === '0' || !response.body)
			return toast.showError('Something went wrong')

		const readableStream = toPolyfillReadable(response.body) as any
		return readableStream.pipeTo(fileStream)
			.then(() => toast.show('Finished downloading File'))
			.catch((error: any) => toast.showError(error))
	} catch (error) {
		toast.showError('Something went wrong')
		console.error(error)
	}
}

export default downloadFile