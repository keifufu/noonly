import { z } from 'zod'
import { AutofillPersonalInfoDTO } from './_shared'

export const AutofillCreatePersonalInfoInputDTO = z.object({
  name_e: z.string().max(4096).optional(),
  firstName_e: z.string().max(4096).optional(),
  lastName_e: z.string().max(4096).optional(),
  email_e: z.string().max(4096).optional(),
  phone_e: z.string().max(4096).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  birthDay_e: z.string().max(4096).optional(),
  birthMonth_e: z.string().max(4096).optional(),
  birthYear_e: z.string().max(4096).optional()
})

export const AutofillCreatePersonalInfoOutputDTO = AutofillPersonalInfoDTO