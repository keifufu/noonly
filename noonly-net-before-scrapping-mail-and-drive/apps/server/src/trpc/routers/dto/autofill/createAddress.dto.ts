import { z } from 'zod'
import { AutofillAddressDTO } from './_shared'

export const AutofillCreateAddressInputDTO = z.object({
  name_e: z.string().max(4096).optional(),
  street_e: z.string().max(4096).optional(),
  city_e: z.string().max(4096).optional(),
  state_e: z.string().max(4096).optional(),
  zipCode_e: z.string().max(4096).optional(),
  country_e: z.string().max(4096).optional()
})

export const AutofillCreateAddressOutputDTO = AutofillAddressDTO