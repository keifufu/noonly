import { useEffect, useRef, useState } from 'react'

import LoadingBar from 'react-top-loading-bar'
import devBuild from 'library/utilities/devBuild'

interface IProps {
	loading: boolean
}

const PageProgress: React.FC<IProps> = ({ loading }) => {
	const isBeta = location.host === 'beta.noonly.net' || devBuild
	const interval = useRef<null | NodeJS.Timeout>(null)
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		if (loading) {
			interval.current = setInterval(() => {
				setProgress((progress) => {
					if (progress >= 80) {
						clearInterval(interval.current as NodeJS.Timeout)
						return progress
					}
					return progress === 100 ? 0 : progress + 10
				})
			}, 100)
		} else {
			clearInterval(interval.current as NodeJS.Timeout)
			setProgress(100)
		}

		return () => clearInterval(interval.current as NodeJS.Timeout)
	}, [loading])

	return (
		<LoadingBar
			progress={progress}
			color='var(--chakra-colors-blue-500)'
			height={isBeta ? 10 : 5}
			loaderSpeed={100}
			waitingTime={500}
			onLoaderFinished={() => setProgress(0)}
		/>
	)
}

export default PageProgress