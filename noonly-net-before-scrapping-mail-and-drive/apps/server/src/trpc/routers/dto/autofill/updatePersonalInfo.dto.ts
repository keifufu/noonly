import { z } from 'zod'
import { AutofillPersonalInfoDTO } from './_shared'

export const AutofillUpdatePersonalInfoInputDTO = z.object({
  id: z.string().length(36),
  name_e: z.string().max(4096).nullable().optional(),
  firstName_e: z.string().max(4096).nullable().optional(),
  lastName_e: z.string().max(4096).nullable().optional(),
  email_e: z.string().max(4096).nullable().optional(),
  phone_e: z.string().max(4096).nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),
  birthDay_e: z.string().max(4096).nullable().optional(),
  birthMonth_e: z.string().max(4096).nullable().optional(),
  birthYear_e: z.string().max(4096).nullable().optional()
})

export const AutofillUpdatePersonalInfoOutputDTO = AutofillPersonalInfoDTO