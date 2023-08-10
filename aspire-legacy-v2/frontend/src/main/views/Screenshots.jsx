import { Grid, makeStyles, useMediaQuery } from '@material-ui/core'
import InfiniteScroll from 'react-infinite-scroller'
import { useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import LazyLoad from 'react-lazyload'
import Helmet from 'react-helmet'
import { useState } from 'react'

import applyScreenshotSort from 'library/common/sort/applyScreenshotSort'
import ScreenshotToolbar from 'library/components/ScreenshotToolbar'
import CenteredText from 'library/components/CenteredText'
import useInitialLoad from 'library/hooks/useInitialLoad'
import Screenshot from 'library/components/Screenshot'

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(2)
	}
}))

function Screenshots({ screenshots: _screenshots, sort, selection }) {
	const hasLoaded = useInitialLoad('screenshots')
	const classes = useStyles()
	const location = useLocation()
	const [page, setPage] = useState(1)
	const displayTrash = location.pathname.includes('/screenshots/trash')
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))
	const displayFavorites = location.pathname.includes('/screenshots/favorite')
	const screenshots = applyScreenshotSort(Object.values(_screenshots).filter((e) => {
		if (e.trash && !displayTrash) return false
		else if (displayTrash && !e.trash) return false
		else if (displayFavorites && !e.favorite) return false
		else return true
	}), sort)

	return (<>
		<Helmet>
			<title>Screenshots - {process.env.REACT_APP_NAME}</title>
		</Helmet>
		<div className={classes.root}>
			{
				hasLoaded
					? (<>
						<ScreenshotToolbar />
						{
							Object.values(_screenshots).filter((e) => !e.trash).length === 0 && !displayTrash
							&& (isMobile
								? <CenteredText text='You currently have no Screenshots.' />
								: <CenteredText text='You currently have no Screenshots.\nGo to your account settings to learn how to upload some!' />)
						} {
							Object.values(_screenshots).filter((e) => e.trash).length === 0 && displayTrash
							&& (isMobile
								? <CenteredText text='Your Trash is empty!' />
								: <CenteredText text='Your Trash is empty!\nOnce you delete your Screenshots you will find them in here!' />)
						} {
							Object.values(_screenshots).filter((e) => e.favorite).length === 0 && displayFavorites
							&& (isMobile
								? <CenteredText text='You have no Favorites!' />
								: <CenteredText text='You have no Favorites!\nClick the star on a Screenshot to add them to your Favorites!' />)
						}
						<InfiniteScroll
							pageStart={1}
							loadMore={(newPage) => {
								if (newPage === page) return
								setPage(newPage)
							}}
							hasMore={screenshots.length > page * 25}
							threshold={1500}
							useWindow={true}
						>
							<Grid container spacing={2}>
								{screenshots.slice(0, page * 25).map((item) => (
									<Grid item xs={12} sm={4} md={4} lg={3} key={item.id}>
										<LazyLoad offset={250}>
											<Screenshot
												screenshot={item}
												selected={selection.includes(item.id)}
											/>
										</LazyLoad>
									</Grid>
								))}
							</Grid>
						</InfiniteScroll>
						{/* <ScreenshotFab /> */}
					</>) : (
						/* Create a nice looking loading bar here. Similar to the one in Mail */
						<div>Loading..</div>
					)
			}
		</div>
	</>)
}


const mapState = (state) => ({
	screenshots: state.screenshots,
	searchInput: state.searchInput,
	sort: state.sort.screenshots,
	selection: state.selection.screenshots
})
const mapDispatch = (dispatch) => ({})
export default connect(mapState, mapDispatch)(Screenshots)