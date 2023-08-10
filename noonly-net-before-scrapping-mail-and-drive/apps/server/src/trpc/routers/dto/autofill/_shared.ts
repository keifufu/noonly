import { AutofillAddressPrismaModel, AutofillCreditCardPrismaModel, AutofillPersonalInfoPrismaModel } from 'src/@generated/zod-prisma'

export const AutofillCreditCardDTO = AutofillCreditCardPrismaModel.omit({
  userId: true
})

export const AutofillAddressDTO = AutofillAddressPrismaModel.omit({
  userId: true
})

export const AutofillPersonalInfoDTO = AutofillPersonalInfoPrismaModel.omit({
  userId: true
})