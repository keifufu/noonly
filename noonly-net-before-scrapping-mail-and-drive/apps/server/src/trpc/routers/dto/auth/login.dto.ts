import { SessionDTO, UserDTO } from '../shared'

import { z } from 'zod'
import { JwtDTO } from './shared'

export const AuthLoginInputDTO = z.object({
  username: z.string().min(3, 'Username too short (3)').max(24, 'Username too long (24)'),
  password: z.string().max(4096, 'Password too long'),
  cancelDeletion: z.boolean().optional()
})

export const AuthLoginOutputDTO = z.object({
  user: UserDTO,
  session: SessionDTO,
  jwt: JwtDTO
})