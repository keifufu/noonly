import { dirname as _dirname } from 'path'
import { platform } from 'os'

function dirname() {
	try {
		// eslint-disable-next-line no-undef
		SpitAnErrorIntoMyFace
	} catch (e) {
		const [initiator] = e.stack.split('\n').slice(2, 3)
		let { path } = (/(?<path>[^(\s]+):[0-9]+:[0-9]+/).exec(initiator).groups
		if (path.indexOf('file') >= 0)
			path = new URL(path).pathname
		let dirname = _dirname(path)
		if (dirname[0] === '/' && platform() === 'win32')
			dirname = dirname.slice(1)
		return dirname
	}
}

export default dirname