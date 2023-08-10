import downloadMultiple from 'main/axios/downloadMultiple'
import download from 'main/axios/download'
import { saveAs } from 'file-saver'

function downloadScreenshots(items, zipname) {
	if (items.length > 1)
		return downloadMultiple(items, zipname)

	return new Promise((resolve, reject) => {
		download(items[0].url).then((res) => {
			saveAs(new Blob([res.data]), items[0].name)
			resolve()
		}).catch((err) => reject(err))
	})
}

export default downloadScreenshots