import { AutofillAddressPrismaModel, AutofillCreditCardPrismaModel, AutofillPersonalInfoPrismaModel } from '../../../../@generated/zod-prisma'

export const AutofillCreditCardDTO = AutofillCreditCardPrismaModel.omit({
  userId: true
})

export const AutofillAddressDTO = AutofillAddressPrismaModel.omit({
  userId: true
})

export const AutofillPersonalInfoDTO = AutofillPersonalInfoPrismaModel.omit({
  userId: true
})