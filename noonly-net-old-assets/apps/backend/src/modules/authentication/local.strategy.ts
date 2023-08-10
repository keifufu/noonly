import { AuthenticationService } from './authentication.service'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { UserDocument } from '../users/user.schema'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authenticationService: AuthenticationService) {
		super({
			usernameField: 'username',
			passwordField: 'password'
		})
	}

	validate(username: string, password: string): Promise<UserDocument> {
		return this.authenticationService.getAuthenticatedUser(username, password)
	}
}