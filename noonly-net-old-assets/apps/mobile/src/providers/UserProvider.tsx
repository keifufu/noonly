import React from 'react'
import api from 'api'

interface IContextProps {
	isLoading: boolean
	isAuthenticated: boolean
	user: Noonly.User
	setUser: (user: Noonly.User) => void,
	logout: () => void
}

const defaultUser: Noonly.User = {
	isTwoFactorAuthenticationEnabled: false,
	isPhoneNumberConfirmed: false,
	phoneNumber: '',
	username: '',
	createdAt: '',
	updatedAt: '',
	id: '',
	sessions: [],
	isSecondaryEmailVerified: false,
	secondaryEmail: null,
	usePhoneNumberFor2FA: false,
	currentSessionId: ''
}

const defaultState = {
	isLoading: true,
	isAuthenticated: false,
	user: defaultUser,
	setUser: () => null,
	logout: () => null
}

export const UserContext = React.createContext<IContextProps>(defaultState)

let _interval: NodeJS.Timeout
export const UserProvider: React.FC = ({ children }) => {
	const [user, setUser] = React.useState<IContextProps>(defaultState)

	React.useEffect(() => {
		// Try and refresh the authentication to figure out if user is still logged in
		api.actions.refresh({ user: true }).then((res) => {
			setUser({
				...user,
				user: res as Noonly.User,
				isLoading: false,
				isAuthenticated: true
			})
		}).catch(() => {
			setUser({
				...user,
				isLoading: false
			})
		})

		_interval = setInterval(() => {
			api.actions.refresh().catch(() => null)
		}, 1000 * 60 * 14)

		return () => clearInterval(_interval)
	}, [])

	const userState = {
		...user,
		setUser: (_user: Noonly.User) => {
			setUser({
				...user,
				user: _user,
				isAuthenticated: true,
				isLoading: false
			})
		},
		logout: () => {
			api.actions.logout().catch(() => null)
			setUser({
				...user,
				user: defaultUser,
				isAuthenticated: false,
				isLoading: false
			})
		}
	}

	return (
		<UserContext.Provider value={userState}>
			{children}
		</UserContext.Provider>
	)
}

export const useUser = (): IContextProps => React.useContext(UserContext)