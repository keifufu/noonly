import devBuild from 'library/utilities/devBuild'
import React from 'react'

if (devBuild) {
	const whyDidYouRender = require('@welldone-software/why-did-you-render')
	whyDidYouRender(React, {
		trackAllPureComponents: true
	})
}