import { z } from 'zod'
import { AutofillAddressDTO } from './_shared'

export const AutofillUpdateAddressInputDTO = z.object({
  id: z.string().length(36),
  name_e: z.string().max(4096).nullable().optional(),
  street_e: z.string().max(4096).nullable().optional(),
  city_e: z.string().max(4096).nullable().optional(),
  state_e: z.string().max(4096).nullable().optional(),
  zipCode_e: z.string().max(4096).nullable().optional(),
  country_e: z.string().max(4096).nullable().optional()
})

export const AutofillUpdateAddressOutputDTO = AutofillAddressDTO