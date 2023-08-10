import { CircularProgress, createMuiTheme, CssBaseline, makeStyles, Paper, ThemeProvider } from '@material-ui/core'
import Helmet from 'react-helmet'

import getCookie from 'library/utilities/getCookie'
import { getThemes } from 'library/common/theme'

const useStyles = makeStyles({
	root: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100vh',
		width: '100vw'
	}
})

const themeCookie = getCookie('theme')
const theme = ['dark', 'light'].includes(themeCookie) ? themeCookie : 'dark'
function Loading() {
	const classes = useStyles()
	const { dark, light } = getThemes()
	const MuiTheme = createMuiTheme(theme === 'dark' ? dark : light)

	return (<>
		<Helmet>
			<title>Loading...</title>
		</Helmet>
		<ThemeProvider theme={MuiTheme}>
			<CssBaseline />
			<Paper square className={classes.root}>
				<CircularProgress size={64} />
			</Paper>
		</ThemeProvider>
	</>)
}

export default Loading