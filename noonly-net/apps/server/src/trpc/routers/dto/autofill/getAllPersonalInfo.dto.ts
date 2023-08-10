import { z } from 'zod'
import { AutofillPersonalInfoDTO } from './_shared'

export const AutofillGetAllPersonalInfoInputDTO = z.void()

export const AutofillGetAllPersonalInfoOutputDTO = z.array(AutofillPersonalInfoDTO)