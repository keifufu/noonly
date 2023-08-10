import replaceQueryParam from 'library/utilities/replaceQueryParam'
import urlParam from 'library/utilities/urlParam'

const searchParam = urlParam('search')
const search = searchParam || ''

export default {
	state: search,
	reducers: {
		set: (state, payload) => {
			const search = replaceQueryParam('search', payload, window.location.search)
			let url = `${window.location.origin}${window.location.pathname}${search}`
			if (url.endsWith('?')) url = url.slice(0, -1)
			window.history.replaceState(window.history.state, window.document.title, url)
			return payload
		}
	}
}