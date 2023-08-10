import fs from 'fs'
import nodePath from 'path'

const getCertificates = (): { key: string, cert: string, ca: string } => {
	if (process.env.USE_SSL === 'false')
		return { key: '', cert: '', ca: '' } 
	const key = fs.readFileSync(nodePath.normalize(process.env.CERT_KEY_PATH)).toString()
	const cert = fs.readFileSync(nodePath.normalize(process.env.CERT_CERT_PATH)).toString()
	const ca = fs.readFileSync(nodePath.normalize(process.env.CERT_CA_PATH)).toString()
	return { key: key, cert: cert, ca: ca }
}

export default getCertificates