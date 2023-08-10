import { z } from 'zod'
import { AutofillAddressDTO } from './_shared'

export const AutofillGetAllAddressesInputDTO = z.void()

export const AutofillGetAllAddressesOutputDTO = z.array(AutofillAddressDTO)