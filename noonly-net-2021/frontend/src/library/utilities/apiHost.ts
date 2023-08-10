import devBuild from 'library/utilities/devBuild'

const apiHost = ((): string => {
	const productionApiHost = `https://oldapi.${process.env.REACT_APP_HOSTNAME}`
	const developmentApiHost = `https://oldapi.${process.env.REACT_APP_HOSTNAME}`
	if (devBuild && process.env.REACT_APP_USE_PROD_API !== 'true') return developmentApiHost
	else return productionApiHost
})()

export default apiHost