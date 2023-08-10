import { z } from 'zod'
import { SecurityLogDTO } from '../shared'

export const UserGetSecurityLogsInputDTO = z.void()

export const UserGetSecurityLogsOutputDTO = z.array(SecurityLogDTO)