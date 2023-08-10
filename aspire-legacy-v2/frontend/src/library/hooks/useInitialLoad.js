import { useEffect, useState } from 'react'
import socket from 'main/socket'
import store from 'main/store'

function useInitialLoad(location) {
	const [hasLoaded, setHasLoaded] = useState(store.getState().initialLoad[location])
	const [hasRequested, setHasRequested] = useState(false)
	if (!hasLoaded && !hasRequested) {
		socket.emit(`LOAD_${location.toUpperCase()}`)
		setHasRequested(true)
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (hasLoaded) return
		const initialLoad = store.getState().initialLoad[location]
		if (initialLoad) setHasLoaded(true)
	})

	return hasLoaded
}

export default useInitialLoad