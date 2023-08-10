import { Redirect, Route, RouteProps } from 'react-router-dom'

import { Suspense } from 'react'
import storage from 'library/utilities/storage'

interface IProps extends RouteProps {
	component: React.FC<any>,
	props?: any
}

const PrivateRoute: React.FC<IProps> = ({ component: Component, props: _props, ...rest }): JSX.Element => (
	<Route
		{...rest}
		render={(props) =>
			(storage.jwtToken ? (
				<Suspense fallback={null}>
					<Component {...props} {..._props} />
				</Suspense>
			) : (
				<Redirect to={{ pathname: '/login' }} />
			))
		}
	/>
)

export default PrivateRoute