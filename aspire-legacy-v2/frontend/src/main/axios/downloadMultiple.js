import download from 'main/axios/download'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

function downloadMultiple(items, zipname) {
	return new Promise((resolve, reject) => {
		const zip = new JSZip()
		let downloaded = 0
		const save = () => {
			zip.generateAsync({ type: 'blob' }).then((blob) => {
				saveAs(blob, zipname)
				resolve()
			})
		}
		items.forEach(({ url, name }, index) => {
			download(url).then((res) => {
				zip.file(name, new Blob([res.data]))
				downloaded += 1
				if (downloaded === index + 1)
					save()
			}).catch((err) => reject(err))
		})
	})
}

export default downloadMultiple