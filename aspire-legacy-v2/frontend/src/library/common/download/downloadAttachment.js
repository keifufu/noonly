import { saveAs } from 'file-saver'

import apiHost from 'library/utilities/apiHost'
import download from 'main/axios/download'

function downloadAttachment(mailId, attachmentId, name) {
	return new Promise((resolve, reject) => {
		const url = `${apiHost}/mail/downloadAttachment?id=${mailId}&attachmentId=${attachmentId}`
		download(url).then((res) => {
			saveAs(new Blob([res.data]), name)
			resolve()
		}).catch((err) => reject(err))
	})
}

export default downloadAttachment