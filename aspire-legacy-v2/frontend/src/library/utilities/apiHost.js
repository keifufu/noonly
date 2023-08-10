import devBuild from 'library/utilities/devBuild'

const apiHost = (() => {
	const productionApiHost = `https://${process.env.REACT_APP_HOSTNAME}:99`
	const developmentApiHost = `https://api.${process.env.REACT_APP_HOSTNAME}`
	if (devBuild) return developmentApiHost
	else return productionApiHost
})()

export default apiHost