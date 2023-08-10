import { Request } from 'express'
import RequestWithUser from 'src/modules/authentication/requestWithUser.interface'

const getIpFromRequest = (request: Request | RequestWithUser): string => request.ip || request.socket.remoteAddress || request.header['X-Forwarded-For']

export default getIpFromRequest