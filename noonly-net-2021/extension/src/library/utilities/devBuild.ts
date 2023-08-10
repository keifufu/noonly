const devBuild = (() => {
	if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') return true
	else return false
})()

export default devBuild