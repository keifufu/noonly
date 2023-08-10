import devBuild from 'library/utilities/devBuild'

const apiHost = (() => {
	const productionApiHost = `https://${process.env.REACT_APP_HOSTNAME}:99`
	const developmentApiHost = `https://${process.env.REACT_APP_HOSTNAME}:100`
	if (devBuild) return developmentApiHost
	else return productionApiHost
})()

export default apiHost