const getHeaders = (csrfToken: string): any => ({
	'X-CSRF-Token': csrfToken
})

export default getHeaders