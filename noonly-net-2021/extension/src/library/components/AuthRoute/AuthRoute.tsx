import { Redirect, Route, RouteProps } from 'react-router-dom'

import storage from 'library/utilities/storage'

interface IProps extends RouteProps {
	component: React.FC<any>,
	props?: any
}

const AuthRoute: React.FC<IProps> = ({ component: Component, props: _props, ...rest }): JSX.Element => (
	<Route
		{...rest}
		render={(props) =>
			(storage.jwtToken ? (
				<Redirect to={{ pathname: '/' }} />
			) : (
				<Component {...props} {..._props} />
			))
		}
	/>
)

export default AuthRoute