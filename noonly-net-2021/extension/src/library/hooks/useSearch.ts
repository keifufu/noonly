import { useEffect, useState } from 'react'

let interval: NodeJS.Timeout
let lastSearch = ''
const useSearch = (): string => {
	const [search, setSearch] = useState('')

	useEffect(() => {
		interval = setInterval(() => {
			const urlsearch = (new URLSearchParams(location.search).get('search') || '').toLowerCase()
			if (urlsearch !== lastSearch) {
				lastSearch = urlsearch
				setSearch(urlsearch)
			}
		}, 200)

		return () => clearInterval(interval)
	}, [])

	return search
}

export default useSearch