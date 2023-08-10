import devBuild from 'library/utilities/devBuild'

const imgHost = ((): string => {
	const productionApiHost = `https://oldimg.${process.env.REACT_APP_HOSTNAME}`
	const developmentApiHost = `https://oldimg.${process.env.REACT_APP_HOSTNAME}`
	if (devBuild && process.env.REACT_APP_USE_PROD_API !== 'true') return developmentApiHost
	else return productionApiHost
})()

export default imgHost