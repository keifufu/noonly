import { z } from 'zod'
import { AutofillCreditCardDTO } from './_shared'

export const AutofillGetAllCreditCardsInputDTO = z.void()

export const AutofillGetAllCreditCardsOutputDTO = z.array(AutofillCreditCardDTO)