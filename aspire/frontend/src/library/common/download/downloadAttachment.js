import { saveAs } from 'file-saver'

import devBuild from 'library/utilities/devBuild'
import download from 'main/axios/download'

function downloadAttachment(mailId, attachmentId, name) {
	return new Promise((resolve, reject) => {
		const url = `https://aspire.icu:${devBuild ? '98' : '97'}/mail/downloadAttachment?id=${mailId}&attachmentId=${attachmentId}`
		download(url).then((res) => {
			saveAs(new Blob([res.data]), name)
			resolve()
		}).catch((err) => reject(err))
	})
}

export default downloadAttachment