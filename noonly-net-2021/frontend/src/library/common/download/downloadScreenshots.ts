import { downloadZip } from 'client-zip'
import imgHost from 'library/utilities/imgHost'

const toBlob = (url: string) => fetch(url).then((res) => res.blob())

const downloadScreenshots = async (names: string[]): Promise<void> => {
	if (names.length > 1) {
		const fetchFiles = (names: string[]): Promise<File[]> => new Promise((resolve) => {
			const files: File[] = []
			let processed = 0
			names.forEach(async (name) => {
				const blob = await toBlob(`${imgHost}/${name}`)
				files.push(new File([blob], `${name}.jpg`))
				processed += 1
				if (processed === names.length)
					resolve(files)
			})
		})
		const files = await fetchFiles(names)
		const blob = await downloadZip(files).blob()
		saveBlob(blob, 'Screenshots.zip')
	} else {
		const blob = await toBlob(`${imgHost}/${names[0]}`)
		saveBlob(blob, `${names[0]}.jpg`)
	}
}

const saveBlob = (blob: Blob, name: string) => {
	const link = document.createElement('a')
	link.href = URL.createObjectURL(blob)
	link.download = name
	link.click()
	link.remove()
}

export default downloadScreenshots