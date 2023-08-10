function replaceQueryParam(param, newval, search) {
	const regex = new RegExp(`([?;&])${param}[^&;]*[;&]?`)
	const query = search.replace(regex, '$1').replace(/&$/, '')

	return (query.length > 2 ? `${query}&` : '?') + (newval ? `${param}=${newval}` : '')
}

export default replaceQueryParam