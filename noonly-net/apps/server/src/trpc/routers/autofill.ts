import { AutofillCreateAddressInputDTO, AutofillCreateAddressOutputDTO } from './dto/autofill/createAddress.dto'
import { AutofillCreateCreditCardInputDTO, AutofillCreateCreditCardOutputDTO } from './dto/autofill/createCreditCard.dto'
import { AutofillCreatePersonalInfoInputDTO, AutofillCreatePersonalInfoOutputDTO } from './dto/autofill/createPersonalInfo.dto'
import { AutofillDeleteAddressInputDTO, AutofillDeleteAddressOutputDTO } from './dto/autofill/deleteAddress.dto'
import { AutofillDeleteCreditCardInputDTO, AutofillDeleteCreditCardOutputDTO } from './dto/autofill/deleteCreditCard.dto'
import { AutofillDeletePersonalInfoInputDTO, AutofillDeletePersonalInfoOutputDTO } from './dto/autofill/deletePersonalInfo.dto'
import { AutofillGetAllAddressesInputDTO, AutofillGetAllAddressesOutputDTO } from './dto/autofill/getAllAddresses.dto'
import { AutofillGetAllCreditCardsInputDTO, AutofillGetAllCreditCardsOutputDTO } from './dto/autofill/getAllCreditCards.dto'
import { AutofillGetAllPersonalInfoInputDTO, AutofillGetAllPersonalInfoOutputDTO } from './dto/autofill/getAllPersonalInfo.dto'
import { AutofillUpdateAddressInputDTO, AutofillUpdateAddressOutputDTO } from './dto/autofill/updateAddress.dto'
import { AutofillUpdateCreditCardInputDTO, AutofillUpdateCreditCardOutputDTO } from './dto/autofill/updateCreditCard.dto'
import { AutofillUpdatePersonalInfoInputDTO, AutofillUpdatePersonalInfoOutputDTO } from './dto/autofill/updatePersonalInfo.dto'

import { TRPCError } from '@trpc/server'
import { prisma } from '../../database/prisma'
import { JwtTwoFactorGuardProcedure } from '../middleware/JwtTwoFactorGuard'
import { router } from '../trpc'

export const autofillRouter = router({
  getAllCreditCards: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/autofill/credit-card/get-all', tags: ['Autofill'], protect: true } })
    .input(AutofillGetAllCreditCardsInputDTO)
    .output(AutofillGetAllCreditCardsOutputDTO)
    .query(async ({ ctx }) => {
      const creditCards = await prisma.autofillCreditCard.findMany({ where: { userId: ctx.user.id } })
      return creditCards
    }),
  createCreditCard: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/autofill/credit-card/create', tags: ['Autofill'], protect: true } })
    .input(AutofillCreateCreditCardInputDTO)
    .output(AutofillCreateCreditCardOutputDTO)
    .query(async ({ ctx, input }) => {
      const creditCard = await prisma.autofillCreditCard.create({
        data: {
          name_e: input.name_e,
          cardholderName_e: input.cardholderName_e,
          cardNumber_e: input.cardNumber_e,
          securityCode_e: input.securityCode_e,
          expirationMonth_e: input.expirationMonth_e,
          expirationYear_e: input.expirationYear_e,
          userId: ctx.user.id
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create Credit Card' })
      })

      return creditCard
    }),
  updateCreditCard: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/autofill/credit-card/update', tags: ['Autofill'], protect: true } })
    .input(AutofillUpdateCreditCardInputDTO)
    .output(AutofillUpdateCreditCardOutputDTO)
    .query(async ({ input }) => {
      const creditCard = await prisma.autofillCreditCard.update({
        where: {
          id: input.id
        },
        data: {
          name_e: input.name_e,
          cardholderName_e: input.cardholderName_e,
          cardNumber_e: input.cardNumber_e,
          securityCode_e: input.securityCode_e,
          expirationMonth_e: input.expirationMonth_e,
          expirationYear_e: input.expirationYear_e
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Credit Card' })
      })

      return creditCard
    }),
  deleteCreditCard: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/autofill/credit-card/delete', tags: ['Autofill'], protect: true } })
    .input(AutofillDeleteCreditCardInputDTO)
    .output(AutofillDeleteCreditCardOutputDTO)
    .query(async ({ input }) => {
      await prisma.autofillCreditCard.delete({
        where: {
          id: input.id
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete Credit Card' })
      })
    }),
  getAllAddresses: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/autofill/address/get-all', tags: ['Autofill'], protect: true } })
    .input(AutofillGetAllAddressesInputDTO)
    .output(AutofillGetAllAddressesOutputDTO)
    .query(async ({ ctx }) => {
      const addresses = await prisma.autofillAddress.findMany({ where: { userId: ctx.user.id } })
      return addresses
    }),
  createAddress: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/autofill/address/create', tags: ['Autofill'], protect: true } })
    .input(AutofillCreateAddressInputDTO)
    .output(AutofillCreateAddressOutputDTO)
    .query(async ({ ctx, input }) => {
      const address = await prisma.autofillAddress.create({
        data: {
          name_e: input.name_e,
          street_e: input.street_e,
          city_e: input.city_e,
          state_e: input.state_e,
          zipCode_e: input.zipCode_e,
          country_e: input.country_e,
          userId: ctx.user.id
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create Address' })
      })

      return address
    }),
  updateAddress: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/autofill/address/update', tags: ['Autofill'], protect: true } })
    .input(AutofillUpdateAddressInputDTO)
    .output(AutofillUpdateAddressOutputDTO)
    .query(async ({ input }) => {
      const address = await prisma.autofillAddress.update({
        where: {
          id: input.id
        },
        data: {
          name_e: input.name_e,
          street_e: input.street_e,
          city_e: input.city_e,
          state_e: input.state_e,
          zipCode_e: input.zipCode_e,
          country_e: input.country_e
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Address' })
      })

      return address
    }),
  deleteAddress: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/autofill/address/delete', tags: ['Autofill'], protect: true } })
    .input(AutofillDeleteAddressInputDTO)
    .output(AutofillDeleteAddressOutputDTO)
    .query(async ({ input }) => {
      await prisma.autofillAddress.delete({
        where: {
          id: input.id
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete Address' })
      })
    }),
  getAllPersonalInfo: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/autofill/personal-info/get-all', tags: ['Autofill'], protect: true } })
    .input(AutofillGetAllPersonalInfoInputDTO)
    .output(AutofillGetAllPersonalInfoOutputDTO)
    .query(async ({ ctx }) => {
      const personalInfo = await prisma.autofillPersonalInfo.findMany({ where: { userId: ctx.user.id } })
      return personalInfo
    }),
  createPersonalInfo: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/autofill/personal-info/create', tags: ['Autofill'], protect: true } })
    .input(AutofillCreatePersonalInfoInputDTO)
    .output(AutofillCreatePersonalInfoOutputDTO)
    .query(async ({ ctx, input }) => {
      const personalInfo = await prisma.autofillPersonalInfo.create({
        data: {
          name_e: input.name_e,
          firstName_e: input.firstName_e,
          lastName_e: input.lastName_e,
          email_e: input.email_e,
          phone_e: input.phone_e,
          gender: input.gender,
          birthDay_e: input.birthDay_e,
          birthMonth_e: input.birthMonth_e,
          birthYear_e: input.birthYear_e,
          userId: ctx.user.id
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create Personal Info' })
      })

      return personalInfo
    }),
  updatePersonalInfo: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/autofill/personal-info/update', tags: ['Autofill'], protect: true } })
    .input(AutofillUpdatePersonalInfoInputDTO)
    .output(AutofillUpdatePersonalInfoOutputDTO)
    .query(async ({ input }) => {
      const personalInfo = await prisma.autofillPersonalInfo.update({
        where: {
          id: input.id
        },
        data: {
          name_e: input.name_e,
          firstName_e: input.firstName_e,
          lastName_e: input.lastName_e,
          email_e: input.email_e,
          phone_e: input.phone_e,
          gender: input.gender,
          birthDay_e: input.birthDay_e,
          birthMonth_e: input.birthMonth_e,
          birthYear_e: input.birthYear_e
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Personal Info' })
      })

      return personalInfo
    }),
  deletePersonalInfo: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/autofill/personal-info/delete', tags: ['Autofill'], protect: true } })
    .input(AutofillDeletePersonalInfoInputDTO)
    .output(AutofillDeletePersonalInfoOutputDTO)
    .query(async ({ input }) => {
      await prisma.autofillPersonalInfo.delete({
        where: {
          id: input.id
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete Personal Info' })
      })
    })
})