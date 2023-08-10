import { ExtendedError } from 'socket.io/dist/namespace'
import { Socket } from 'socket.io'
import { UserDocument } from '@main/database/models/User.model'
import jwt from 'jsonwebtoken'
import userService from '@main/database/services/User.service'

const authorize = (socket: Socket, next: (err?: ExtendedError | undefined) => void): void => {
	const authorizationHeader = socket.request.headers.authorization
	let token: string | undefined
	let error

	if (authorizationHeader) {
		const parts = authorizationHeader.split(' ')
		if (parts.length === 2) {
			const [scheme, credentials] = parts
			if (scheme.toLowerCase() === 'bearer')
				token = credentials
		} else {
			error = new Error('Unauthorized')
		}
	}

	if (!token) error = new Error('Unauthorized')
	if (error) return next(error)

	jwt.verify(token as string, process.env.JWT_SECRET as string, async (err, decoded: any) => {
		if (err) return next(new Error('Unauthorized'))

		const user = await userService.findById(decoded?.id)
		if (!user) return next(new Error('Unauthorized'))
		const modifySocket = (socket: Socket, user: UserDocument) => {
			(socket as Noonly.Socket.Socket).user = user
		}
		modifySocket(socket, user)

		next()
	})
}

export default authorize