import React from 'react'
import SyncStorage from 'sync-storage'

type IContextProps = typeof SyncStorage

export const StorageContext = React.createContext<IContextProps>(SyncStorage)

export const StorageProvider: React.FC = ({ children }) => {
	const [initialized, setInitialized] = React.useState(false)

	React.useEffect(() => {
		SyncStorage.init().then(() => {
			console.log('Initialized SyncStorage')
			setInitialized(true)
		})
	}, [])

	return (
		<StorageContext.Provider value={SyncStorage}>
			{
				initialized ? children : null
			}
		</StorageContext.Provider>
	)
}

export const useStorage = (): IContextProps => React.useContext(StorageContext)