import { AuthenticationService } from '../authentication/authentication.service'
import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { parse } from 'cookie'

@Injectable()
export class InternalSocketService {
	constructor(
		private readonly authenticationService: AuthenticationService
	) {}

	async getUserFromSocket(socket: Socket) {
		const { cookie } = socket.handshake.headers
		const { Authentication: authenticationToken } = parse(cookie || '')
		const user = await this.authenticationService.getUserFromAuthenticationToken(authenticationToken)
		if (!user)
			socket.disconnect()
		return user
	}
}