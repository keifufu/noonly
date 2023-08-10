const userAgentAliases = {
	okhttp: 'Noonly Android App'
}

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#which_part_of_the_user_agent_contains_the_information_you_are_looking_for
const applyUserAgentAliases = (userAgent: string): string => {
	let alias = userAgent
	Object.keys(userAgentAliases).forEach((key) => {
		if (userAgent.includes(key))
			alias = userAgentAliases[key]
	})
	if (userAgent.includes('Firefox/') && !userAgent.includes('Seamonkey/'))
		alias = 'Firefox'
	else if (userAgent.includes('Seamonkey/'))
		alias = 'Firefox'
	else if (userAgent.includes('Chrome/') && !userAgent.includes('Chromium/'))
		alias = 'Chrome'
	else if (userAgent.includes('Chromium/'))
		alias = 'Chromium'
	else if (userAgent.includes('Safari') && !userAgent.includes('Chrome/') && !userAgent.includes('Chromium/'))
		alias = 'Safari'
	else if (userAgent.includes('OPR/') || userAgent.includes('Opera/'))
		alias = 'Opera'
	else if (userAgent.includes('; MSIE') || userAgent.includes('Trident/7.0; .*'))
		alias = 'Internet Explorer'
	return alias
}

export default applyUserAgentAliases