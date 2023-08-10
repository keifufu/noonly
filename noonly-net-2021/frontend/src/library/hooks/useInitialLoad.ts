import { useEffect, useState } from 'react'

import { RootState } from 'main/store/store'
import socket from 'main/socket'
import store from 'main/store'
import { useSelector } from 'react-redux'

const useInitialLoad = (type: Noonly.State.InitialLoadTypes): boolean => {
	const [hasLoaded, setHasLoaded] = useState(store.getState().initialLoad[type] as boolean)
	const appLoaded = useSelector((state: RootState) => state.initialLoad.app)

	useEffect(() => {
		if (appLoaded === 'DISCONNECTED') return
		socket.emit(`LOAD_${type.toUpperCase()}`)
		const interval = setInterval(() => {
			const initialLoad = store.getState().initialLoad[type]
			if (initialLoad) {
				clearInterval(interval)
				setHasLoaded(true)
			}
		}, 100)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appLoaded])

	return hasLoaded
}

export default useInitialLoad