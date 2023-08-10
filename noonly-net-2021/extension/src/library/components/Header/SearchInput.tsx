import { Input, InputGroup, InputLeftElement } from '@chakra-ui/input'
import { memo, useEffect, useRef, useState } from 'react'

import { MdSearch } from 'react-icons/md'
import isExtension from 'library/utilities/isExtension'

const replaceQueryParam = (param: string, newval: string, search: string): string => {
	const regex = new RegExp(`([?;&])${param}[^&;]*[;&]?`)
	const query = search.replace(regex, '$1').replace(/&$/, '')

	return (query.length > 2 ? `${query}&` : '?') + (newval ? `${param}=${newval}` : '')
}

const updateLocation = (value?: string): void => {
	const search = replaceQueryParam('search', value || '', window.location.search)
	let url = `${window.location.origin}${window.location.pathname}${search}`
	if (url.endsWith('?')) url = url.slice(0, -1)
	window.history.replaceState(window.history.state, window.document.title, url)
}

const SearchInput: React.FC = memo(() => {
	const _search = new URLSearchParams(location.search).get('search')
	const searchInputRef = useRef<null | HTMLInputElement>(null)
	const [search, setSearch] = useState(_search || '')
	const lastFocus = useRef<null | any>(null)

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateLocation(e.target?.value)
		setSearch(e.target.value)
	}

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'f' && e.ctrlKey) {
				e.preventDefault()
				lastFocus.current = document.activeElement
				searchInputRef.current?.focus()
			} else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
				e.preventDefault()
				lastFocus.current?.focus()
				if (lastFocus.current?.tabIndex === -1) {
					const { activeElement }: { activeElement: any } = document
					activeElement?.blur()
				}
			}
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [])

	return (
		<InputGroup>
			<InputLeftElement
				pointerEvents='none'
				children={<MdSearch size='20' />}
			/>
			<Input
				/* Autofocus search input on extension */
				autoFocus={isExtension}
				ref={searchInputRef}
				value={search}
				onChange={onChange}
				bg='gray.600'
				variant='filled'
				placeholder='Search'
				rounded='md'
				width={{ base: 'lg', md: '3xs' }}
			/>
		</InputGroup>
	)
})

export default SearchInput