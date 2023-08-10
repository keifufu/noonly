import { type Prisma } from '@prisma/client'
import { PasswordAcceptInviteInputDTO, PasswordAcceptInviteOutputDTO } from './dto/password/acceptInvite.dto'
import { PasswordCreateInputDTO, PasswordCreateOutputDTO } from './dto/password/create.dto'
import { PasswordCreateCategoryInputDTO, PasswordCreateCategoryOutputDTO } from './dto/password/createCategory.dto'
import { PasswordCreateIconInputDTO, PasswordCreateIconOutputDTO } from './dto/password/createIcon.dto'
import { PasswordDeleteInputDTO, PasswordDeleteOutputDTO } from './dto/password/delete.dto'
import { PasswordDeleteAllPendingInputDTO, PasswordDeleteAllPendingOutputDTO } from './dto/password/deleteAllPending.dto'
import { PasswordDeleteCategoryInputDTO, PasswordDeleteCategoryOutputDTO } from './dto/password/deleteCategory.dto'
import { PasswordDeleteIconInputDTO, PasswordDeleteIconOutputDTO } from './dto/password/deleteIcon.dto'
import { PasswordDeleteSharedInputDTO, PasswordDeleteSharedOutputDTO } from './dto/password/deleteShared.dto'
import { PasswordGetAllCategoriesInputDTO, PasswordGetAllCategoriesOutputDTO } from './dto/password/getAllCategories.dto'
import { PasswordGetAllIconsInputDTO, PasswordGetAllIconsOutputDTO } from './dto/password/getAllIcons.dto'
import { PasswordGetAllOwnedInputDTO, PasswordGetAllOwnedOutputDTO } from './dto/password/getAllOwned.dto'
import { PasswordGetAllSharedInputDTO, PasswordGetAllSharedOutputDTO } from './dto/password/getAllShared.dto'
import { PasswordGetChangelogsInputDTO, PasswordGetChangelogsOutputDTO } from './dto/password/getChangelogs.dto'
import { PasswordGetIconInputDTO, PasswordGetIconOutputDTO } from './dto/password/getIcon.dto'
import { PasswordGetInvitesInputDTO, PasswordGetInvitesOutputDTO } from './dto/password/getInvites.dto'
import { PasswordGetSharedUpdateInformationInputDTO, PasswordGetSharedUpdateInformationOutputDTO } from './dto/password/getSharedUpdateInformation.dto'
import { PasswordGetSharedUsersInputDTO, PasswordGetSharedUsersOutputDTO, type PasswordSharedUserState } from './dto/password/getSharedUsers.dto'
import { PasswordRollbackInputDTO, PasswordRollbackOutputDTO } from './dto/password/rollback.dto'
import { PasswordShareWithUserInputDTO, PasswordShareWithUserOutputDTO } from './dto/password/shareWithUser.dto'
import { PasswordUpdateInputDTO, PasswordUpdateOutputDTO } from './dto/password/update.dto'
import { PasswordUpdateCategoryInputDTO, PasswordUpdateCategoryOutputDTO } from './dto/password/updateCategory.dto'
import { PasswordUpdateCategoryOrderInputDTO, PasswordUpdateCategoryOrderOutputDTO } from './dto/password/updateCategoryOrder.dto'
import { PasswordUpdateSharedInputDTO, PasswordUpdateSharedOutputDTO } from './dto/password/updateShared.dto'
import { PasswordUpdateSharedShareNoteInputDTO, PasswordUpdateSharedShareNoteOutputDTO } from './dto/password/updateSharedShareNote.dto'

import { TRPCError } from '@trpc/server'
import { type Request } from 'express'
import multiparty from 'multiparty'
import sharp from 'sharp'
import { type z } from 'zod'
import { prisma } from '../../database/prisma'
import { type UserWithTierLimits } from '../context'
import { JwtTwoFactorGuardProcedure } from '../middleware/JwtTwoFactorGuard'
import { RateLimitGuardProcedure } from '../middleware/RateLimitGuard'
import { router } from '../trpc'

const iconCache: any = {}

export const passwordRouter = router({
  getAllOwned: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/password/get-all-owned', tags: ['Password'], protect: true } })
    .input(PasswordGetAllOwnedInputDTO)
    .output(PasswordGetAllOwnedOutputDTO)
    .query(async ({ ctx }) => {
      const passwords = await prisma.password.findMany({ where: { userId: ctx.user.id, snapshotOfPasswordId: null } })
      return passwords
    }),
  getAllShared: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/password/get-all-shared', tags: ['Password'], protect: true } })
    .input(PasswordGetAllSharedInputDTO)
    .output(PasswordGetAllSharedOutputDTO)
    .query(async ({ ctx }) => {
      const sharedPasswords = await prisma.sharedPassword.findMany({ where: { sharedUserId: ctx.user.id, inviteKey: null } })

      return sharedPasswords
    }),
  getChangelogs: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/password/get-changelogs', tags: ['Password'], protect: true } })
    .input(PasswordGetChangelogsInputDTO)
    .output(PasswordGetChangelogsOutputDTO)
    .query(async ({ ctx, input }) => {
      const password = await prisma.password.findUnique({ where: { userId: ctx.user.id, id: input.passwordId }, select: { changelogs: true } })
      if (!password)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Password not found' })

      return password.changelogs
    }),
  getInvites: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/password/get-invites', tags: ['Password'], protect: true } })
    .input(PasswordGetInvitesInputDTO)
    .output(PasswordGetInvitesOutputDTO)
    .query(async ({ ctx }) => {
      // Get all shared passwords that have yet to be accepted
      const sharedPasswords = await prisma.sharedPassword.findMany({ where: { sharedUserId: ctx.user.id, inviteKey: { not: null } } })
      return sharedPasswords
    }),
  getSharedUsers: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/password/get-shared-users', tags: ['Password'], protect: true } })
    .input(PasswordGetSharedUsersInputDTO)
    .output(PasswordGetSharedUsersOutputDTO)
    .query(async ({ ctx, input }) => {
      const password = await prisma.password.findUnique({ where: { id: input.id, userId: ctx.user.id },
        select: { sharedPasswords: true } })

      const userStates: PasswordSharedUserState[] = []
      password?.sharedPasswords.forEach((sharedPassword) => {
        userStates.push({
          sharedPasswordId: sharedPassword.id,
          userId: sharedPassword.sharedUserId,
          username: sharedPassword.sharedUserUsername,
          isPending: sharedPassword.inviteKey !== null,
          shareNote: sharedPassword.shareNote,
          createdAt: sharedPassword.createdAt
        })
      })

      return userStates
    }),
  create: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/create', tags: ['Password'], protect: true } })
    .input(PasswordCreateInputDTO)
    .output(PasswordCreateOutputDTO)
    .query(async ({ input, ctx }) => {
      if (ctx.user.tierUsage.currentPasswords >= ctx.user.tierLimits.passwords.maxPasswords)
        throw new TRPCError({ code: 'FORBIDDEN', message: `You have reached the maximum amount of passwords (${ctx.user.tierLimits.passwords.maxPasswords})` })

      const password = await prisma.$transaction(async (tc) => {
        const password = await tc.password.create({
          data: {
            userId: ctx.user.id,
            isAutofillEnabled: input.isAutofillEnabled,
            data_e: input.data_e
          }
        })
        await createPasswordSnapshot(tc, password.id, ctx.user, 'Created password')
        await tc.user.update({ where: { id: ctx.user.id }, data: { tierUsage: { update: { currentPasswords: { increment: 1 } } } } })
        return password
      })
      return password
    }),
  update: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/update', tags: ['Password'], protect: true } })
    .input(PasswordUpdateInputDTO)
    .output(PasswordUpdateOutputDTO)
    .query(async ({ input, ctx }) => {
      const category = input.categoryId === null ? { disconnect: true } : input.categoryId ? { connect: { id: input.categoryId } } : {}
      const icon = input.iconId === null ? { disconnect: true } : input.iconId ? { connect: { id: input.iconId } } : {}
      const deletedAt = input.isDeleted ? new Date() : null

      const password = await prisma.$transaction(async (tc) => {
        const password = await tc.password.update({ where: { id: input.id, userId: ctx.user.id },
          data: {
            data_e: input.data_e,
            note_e: input.note_e,
            isPinned: input.isPinned,
            isAutofillEnabled: input.isAutofillEnabled,
            isDeleted: input.isDeleted,
            deletedAt: deletedAt,
            category: category,
            icon: icon
          } })

        // Unshare password if moving to trash
        if (input.isDeleted) {
          await tc.sharedPassword.deleteMany({ where: { passwordId: input.id, ownerId: ctx.user.id } })
        } else {
          await input.sharedPasswordData?.asyncForEach(async (e) => {
            // Client decides whether or not to include note_e, encrypted with the correct key
            await tc.sharedPassword.update({ where: { id: e.sharedPasswordId, passwordId: input.id, ownerId: ctx.user.id },
              data: {
                data_e: e.data_e,
                ownerNote_e: e.note_e
              } })
          })
        }


        const changelogMessage = getChangelogMessage(input)
        await createPasswordSnapshot(tc, password.id, ctx.user, changelogMessage)

        return password
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update password' })
      })

      return password
    }),
  delete: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/delete', tags: ['Password'], protect: true } })
    .input(PasswordDeleteInputDTO)
    .output(PasswordDeleteOutputDTO)
    .query(async ({ input, ctx }) => {
      await prisma.$transaction([
        prisma.password.delete({ where: { id: input.id, userId: ctx.user.id } }),
        prisma.password.deleteMany({ where: { snapshotOfPasswordId: input.id, userId: ctx.user.id } }),
        prisma.user.update({ where: { id: ctx.user.id }, data: { tierUsage: { update: { currentPasswords: { decrement: 1 } } } } })
      ]).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete password' })
      })
    }),
  deleteAllPending: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/delete-all-pending', tags: ['Password'], protect: true } })
    .input(PasswordDeleteAllPendingInputDTO)
    .output(PasswordDeleteAllPendingOutputDTO)
    .query(async ({ ctx }) => {
      await prisma.$transaction(async (tc) => {
        const passwords = await tc.password.findMany({ where: { isDeleted: true } })
        passwords.forEach((password) => {
          tc.password.delete({ where: { id: password.id } })
          tc.password.deleteMany({ where: { snapshotOfPasswordId: password.id } })
        })
        prisma.user.update({ where: { id: ctx.user.id }, data: { tierUsage: { update: { currentPasswords: { decrement: passwords.length } } } } })
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete Passwords' })
      })
    }),
  getIcon: RateLimitGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/password/get-icon', tags: ['Password'] } })
    .input(PasswordGetIconInputDTO)
    .output(PasswordGetIconOutputDTO)
    .query(async ({ ctx, input }) => {
      if (iconCache[input.id]) {
        const img = Buffer.from(iconCache[input.id], 'base64')
        ctx.res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        ctx.res.setHeader('Content-Type', 'image/webp')
        ctx.res.setHeader('Content-Length', img.length)
        ctx.res.end(img)
      }

      const icon = await prisma.passwordIcon.findUnique({ where: { id: input.id }, select: { data: true } })
      if (!icon)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Icon not found' })

      iconCache[input.id] = icon.data

      ctx.res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      ctx.res.setHeader('Content-Type', 'image/webp')
      ctx.res.setHeader('Content-Length', icon.data.length)
      ctx.res.end(icon.data)
    }),
  getAllIcons: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/password/get-all-icons', tags: ['Password'], protect: true } })
    .input(PasswordGetAllIconsInputDTO)
    .output(PasswordGetAllIconsOutputDTO)
    .query(async ({ ctx }) => {
      const icons = await prisma.passwordIcon.findMany({ where: { userId: ctx.user.id } })
      return icons
    }),
  createIcon: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/create-icon', tags: ['Password'], protect: true } })
    .input(PasswordCreateIconInputDTO)
    .output(PasswordCreateIconOutputDTO)
    .query(async ({ ctx }) => {
      if (ctx.user.tierUsage.currentCustomIcons >= ctx.user.tierLimits.passwords.maxCustomIcons)
        throw new TRPCError({ code: 'FORBIDDEN', message: `Maximum number of custom icons reached (${ctx.user.tierLimits.passwords.maxCustomIcons})` })

      const { files } = await parseMultipartyForm(ctx.req).catch(() => {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to parse form' })
      })

      const iconFile = files.icon
      if (!iconFile) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No icon provided' })

      const iconBuffer = await sharp(iconFile.path, { animated: true })
        .webp({ quality: 100 })
        .toBuffer()
        .catch(() => {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to convert icon to webp' })
        })

      const [icon] = await prisma.$transaction([
        prisma.passwordIcon.create({ data: { userId: ctx.user.id, data: iconBuffer } }),
        prisma.user.update({ where: { id: ctx.user.id }, data: { tierUsage: { update: { currentCustomIcons: { increment: 1 } } } } })
      ]).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create Icon' })
      })

      return icon
    }),
  deleteIcon: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/delete-icon', tags: ['Password'], protect: true } })
    .input(PasswordDeleteIconInputDTO)
    .output(PasswordDeleteIconOutputDTO)
    .query(async ({ input, ctx }) => {
      await prisma.$transaction([
        prisma.passwordIcon.delete({ where: { id: input.id, userId: ctx.user.id } }),
        prisma.user.update({ where: { id: ctx.user.id }, data: { tierUsage: { update: { currentCustomIcons: { decrement: 1 } } } } })
      ]).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete Icon' })
      })
    }),
  getAllCategories: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/password/get-all-categories', tags: ['Password'], protect: true } })
    .input(PasswordGetAllCategoriesInputDTO)
    .output(PasswordGetAllCategoriesOutputDTO)
    .query(async ({ ctx }) => {
      const passwordCategories = await prisma.passwordCategory.findMany({ where: { userId: ctx.user.id } })
      return passwordCategories
    }),
  createCategory: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/create-category', tags: ['Password'], protect: true } })
    .input(PasswordCreateCategoryInputDTO)
    .output(PasswordCreateCategoryOutputDTO)
    .query(async ({ ctx, input }) => {
      const highestOrder = await prisma.passwordCategory.findFirst({ where: { userId: ctx.user.id }, orderBy: { order: 'desc' }, select: { order: true } })
      const category = await prisma.passwordCategory.create({
        data: {
          userId: ctx.user.id,
          name_e: input.name_e,
          order: (highestOrder?.order || 0) + 1
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Category' })
      })

      return category
    }),
  updateCategory: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/update-category', tags: ['Password'], protect: true } })
    .input(PasswordUpdateCategoryInputDTO)
    .output(PasswordUpdateCategoryOutputDTO)
    .query(async ({ input, ctx }) => {
      const category = await prisma.passwordCategory.update({
        where: { id: input.id, userId: ctx.user.id },
        data: { name_e: input.name_e }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Category' })
      })

      return category
    }),
  updateCategoryOrder: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/update-category-order', tags: ['Password'], protect: true } })
    .input(PasswordUpdateCategoryOrderInputDTO)
    .output(PasswordUpdateCategoryOrderOutputDTO)
    .query(async ({ input, ctx }) => {
      await prisma.$transaction(input.categories.map((e) => prisma.passwordCategory.update({
        where: { id: e.id, userId: ctx.user.id },
        data: { order: e.order }
      }))).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Categories' })
      })
      const passwordCategories = await prisma.passwordCategory.findMany({ where: { userId: ctx.user.id } })
      return passwordCategories
    }),
  deleteCategory: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/delete-category', tags: ['Password'], protect: true } })
    .input(PasswordDeleteCategoryInputDTO)
    .output(PasswordDeleteCategoryOutputDTO)
    .query(async ({ input, ctx }) => {
      await prisma.passwordCategory.delete({ where: { id: input.id, userId: ctx.user.id } }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete Password' })
      })
    }),
  getSharedUpdateInformation: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/password/get-shared-update-information', tags: ['Password'], protect: true } })
    .input(PasswordGetSharedUpdateInformationInputDTO)
    .output(PasswordGetSharedUpdateInformationOutputDTO)
    .query(async ({ input, ctx }) => {
      const sharedPasswords = await prisma.sharedPassword.findMany({ where: { passwordId: input.passwordId, ownerId: ctx.user.id } })
      return sharedPasswords.map((e) => ({ sharedPasswordId: e.id, key_e: e.ownerKey_e }))
    }),
  shareWithUser: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/share-with-user', tags: ['Password'], protect: true } })
    .input(PasswordShareWithUserInputDTO)
    .output(PasswordShareWithUserOutputDTO)
    .query(async ({ input, ctx }) => {
      if (!ctx.user.tierLimits.passwords.canShare)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Upgrade to be able to share passwords' })

      const user = await prisma.user.findUnique({ where: { id: input.userId } })
      if (!user) throw new TRPCError({ code: 'BAD_REQUEST', message: 'User does not exist' })

      const password = await prisma.password.findUnique({ where: { id: input.passwordId, userId: ctx.user.id } })
      if (!password) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Password does not exist' })

      await prisma.password.update({
        where: { id: input.passwordId, userId: ctx.user.id, sharedPasswords: { none: { sharedUserId: input.userId } } },
        data: {
          sharedCount: { increment: 1 },
          sharedPasswords: {
            create: {
              sharedUserId: input.userId,
              sharedUserUsername: user.username,
              ownerId: ctx.user.id,
              ownerUsername: ctx.user.username,
              ownerKey_e: input.ownerKey_e,
              inviteKey: input.inviteKey,
              shareNote: input.shareNote,
              data_e: input.data_e,
              ownerNote_e: input.shareNote ? input.note_e : null,
              inviteMessage_e: input.inviteMessage_e
            }
          }
        }
      }).catch((e) => {
        if (e.code === 'P2025')
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Password already shared with that user' })
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to share password' })
      })
    }),
  acceptInvite: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/accept-invite', tags: ['Password'], protect: true } })
    .input(PasswordAcceptInviteInputDTO)
    .output(PasswordAcceptInviteOutputDTO)
    .query(async ({ input, ctx }) => {
      const sharedPassword = await prisma.sharedPassword.update({
        where: {
          id: input.sharedPasswordId,
          sharedUserId: ctx.user.id
        },
        data: {
          sharedUserKey_e: input.sharedUserKey_e,
          inviteKey: null,
          inviteMessage_e: null
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to accept invite' })
      })

      return sharedPassword
    }),
  // This is for the shared user to update anything except passwordData
  updateShared: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/update-shared', tags: ['Password'], protect: true } })
    .input(PasswordUpdateSharedInputDTO)
    .output(PasswordUpdateSharedOutputDTO)
    .query(async ({ input, ctx }) => {
      const category = input.categoryId === null ? { disconnect: true } : input.categoryId ? { connect: { id: input.categoryId } } : {}
      const icon = input.iconId === null ? { disconnect: true } : input.iconId ? { connect: { id: input.iconId } } : {}
      const sharedPassword = await prisma.sharedPassword.update({ where: { id: input.id, sharedUserId: ctx.user.id },
        data: {
          name_e: input.name_e,
          note_e: input.note_e,
          isPinned: input.isPinned,
          isAutofillEnabled: input.isAutofillEnabled,
          category: category,
          icon: icon
        } }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Shared Password' })
      })

      return sharedPassword
    }),
  updateSharedShareNote: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/update-shared-share-note', tags: ['Password'], protect: true } })
    .input(PasswordUpdateSharedShareNoteInputDTO)
    .output(PasswordUpdateSharedShareNoteOutputDTO)
    .query(async ({ input, ctx }) => {
      await prisma.sharedPassword.update({ where: { id: input.sharedPasswordId, ownerId: ctx.user.id }, data: {
        shareNote: input.shareNote,
        ownerNote_e: input.note_e
      } }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Shared Password' })
      })
    }),
  // This endpoint is used to cancel an invite, deny an invite, or revoke a share
  deleteShared: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/delete-shared', tags: ['Password'], protect: true } })
    .input(PasswordDeleteSharedInputDTO)
    .output(PasswordDeleteSharedOutputDTO)
    .query(async ({ input, ctx }) => {
      await prisma.$transaction(async (tc) => {
        const sharedPassword = await tc.sharedPassword.delete({ where: { id: input.sharedPasswordId, OR: [{ sharedUserId: ctx.user.id }, { ownerId: ctx.user.id }] } })
        await tc.password.update({ where: { id: sharedPassword.passwordId }, data: { sharedCount: { decrement: 1 } } })
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete shared password' })
      })
    }),
  /* createSubscription: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/create-subscription', tags: ['Password'], protect: true } })
    .input(PasswordCreateSubscriptionInputDTO)
    .output(PasswordCreateSubscriptionOutputDTO)
    .query(async ({ input, ctx }) => {
      const password = await prisma.$transaction(async (tc) => {
        const password = await tc.password.update({
          where: {
            id: input.passwordId,
            userId: ctx.user.id
          },
          data: {
            subscriptions: {
              create: {
                name: input.name,
                amount: input.amount,
                currency: input.currency,
                billingPeriod: input.billingPeriod,
                paymentDate: input.paymentDate
              }
            }
          },
          include: { subscriptions: true }
        })

        await createPasswordSnapshot(tc, password.id, ctx.user, `Created subscription: ${input.name}`)

        return password
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create subscription' })
      })

      return password
    }),
  updateSubscription: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/update-subscription', tags: ['Password'], protect: true } })
    .input(PasswordUpdateSubscriptionInputDTO)
    .output(PasswordUpdateSubscriptionOutputDTO)
    .query(async ({ input, ctx }) => {
      // Getting the subscription just to put the name in the changelog message
      // We do not check for userId here, but we do in the update query, so it's fine.
      const subscription = await prisma.passwordSubscription.findUnique({ where: { id: input.subscriptionId } })
      if (!subscription)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update subscription' })

      const password = await prisma.$transaction(async (tc) => {
        const password = await tc.password.update({
          where: {
            id: subscription.passwordId,
            userId: ctx.user.id
          },
          data: {
            subscriptions: {
              update: {
                where: {
                  id: input.subscriptionId
                },
                data: {
                  name: input.name,
                  amount: input.amount,
                  currency: input.currency,
                  billingPeriod: input.billingPeriod,
                  paymentDate: input.paymentDate
                }
              }
            }
          },
          include: { subscriptions: true }
        })
        await createPasswordSnapshot(tc, password.id, ctx.user, `Updated subscription: ${subscription.name}`)

        return password
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update subscription' })
      })

      return password
    }),
  deleteSubscription: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/delete-subscription', tags: ['Password'], protect: true } })
    .input(PasswordDeleteSubscriptionInputDTO)
    .output(PasswordDeleteSubscriptionOutputDTO)
    .query(async ({ input, ctx }) => {
      // Getting the subscription just to put the name in the changelog message
      // We do not check for userId here, but we do in the update query, so it's fine.
      const subscription = await prisma.passwordSubscription.findUnique({ where: { id: input.id } })
      if (!subscription)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update subscription' })

      const password = await prisma.$transaction(async (tc) => {
        const password = await tc.password.update({
          where: {
            id: subscription.passwordId,
            userId: ctx.user.id
          },
          data: {
            subscriptions: {
              delete: {
                id: input.id
              }
            }
          },
          include: { subscriptions: true }
        })
        await createPasswordSnapshot(tc, password.id, ctx.user, `Deleted subscription: ${subscription.name}`)

        return password
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete subscription' })
      })

      return password
    }), */
  rollback: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/password/rollback', tags: ['Password'], protect: true } })
    .input(PasswordRollbackInputDTO)
    .output(PasswordRollbackOutputDTO)
    .query(async ({ input, ctx }) => {
      const password = await prisma.password.findUnique({ where: { id: input.passwordId, userId: ctx.user.id } })
      if (!password)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to find Password' })

      const snapshotPassword = await prisma.password.findUnique({ where:
        { id: input.snapshotId, userId: ctx.user.id, snapshotOfPasswordId: password.id },
      include: { changelogs: true } })
      if (!snapshotPassword)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to find Snapshot' })

      const category = snapshotPassword.categoryId ? { connect: { id: snapshotPassword.categoryId } } : {}
      const icon = snapshotPassword.iconId ? { connect: { id: snapshotPassword.iconId } } : {}
      const [,, newPassword] = await prisma.$transaction([
        // delete all newer snapshots
        prisma.password.deleteMany({ where: { snapshotOfPasswordId: password.id, createdAt: { gt: snapshotPassword.createdAt } } }),
        // By deleting the original, all shared passwords will cascade delete
        prisma.password.delete({ where: { id: password.id } }),
        // Create new Password with the same id as the original
        prisma.password.create({ data: {
          id: password.id,
          userId: ctx.user.id,
          category: category,
          icon: icon,
          isAutofillEnabled: snapshotPassword.isAutofillEnabled,
          isPinned: snapshotPassword.isPinned,
          snapshotOfPasswordId: null,
          changelogs: {
            create: snapshotPassword.changelogs.map((e) => ({
              message: e.message,
              snapshotId: e.snapshotId
            }))
          },
          data_e: snapshotPassword.data_e,
          note_e: snapshotPassword.note_e
        } })
      ]).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to rollback Password' })
      })

      return newPassword
    })
})

async function createPasswordSnapshot(tc: Prisma.TransactionClient, id: string, user: UserWithTierLimits, message: string) {
  if (user.tierLimits.passwords.maxSnapshotsPerPassword > -1) {
    const snapshotsForThisPassword = await tc.password.count({ where: { snapshotOfPasswordId: id } })
    if (snapshotsForThisPassword >= user.tierLimits.passwords.maxSnapshotsPerPassword) {
      const oldestSnapshot = await tc.password.findFirst({ where: { snapshotOfPasswordId: id }, orderBy: { createdAt: 'asc' } })
      if (oldestSnapshot) {
        await tc.password.delete({ where: { id: oldestSnapshot.id } })
        await tc.passwordChangelog.updateMany({ where: { snapshotId: oldestSnapshot.id }, data: { snapshotId: null } })
      }
    }
  }

  const passwordToSnapshot = await tc.password.findUnique({ where: { id, userId: user.id },
    include: { changelogs: true } })
  if (!passwordToSnapshot) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Password not found' })

  const category = passwordToSnapshot.categoryId ? { connect: { id: passwordToSnapshot.categoryId } } : {}
  const icon = passwordToSnapshot.iconId ? { connect: { id: passwordToSnapshot.iconId } } : {}

  const passwordSnapshot = await tc.password.create({
    data: {
      userId: user.id,
      category: category,
      icon: icon,
      isAutofillEnabled: passwordToSnapshot.isAutofillEnabled,
      isPinned: passwordToSnapshot.isPinned,
      snapshotOfPasswordId: passwordToSnapshot.id,
      data_e: passwordToSnapshot.data_e,
      note_e: passwordToSnapshot.note_e,
      changelogs: {
        create: passwordToSnapshot.changelogs.map((e) => ({
          message: e.message,
          snapshotId: e.snapshotId
        }))
      }
    }
  })

  await tc.password.update({
    where: { id: passwordSnapshot.id },
    data: {
      changelogs: {
        create: {
          snapshotId: passwordSnapshot.id,
          message
        }
      }
    }
  })

  await tc.password.update({
    where: { id },
    data: {
      changelogs: {
        create: {
          snapshotId: passwordSnapshot.id,
          message
        }
      }
    }
  })
}

function getChangelogMessage(input: z.infer<typeof PasswordUpdateInputDTO>) {
  const updatedVariables: string[] = []
  for (const key of Object.keys(input)) {
    if (key !== 'id' && key !== 'sharedPasswordData' && key !== 'isDeleted') {
      if (key === 'name_e')
        updatedVariables.push('Name')
      else if (key === 'email_e')
        updatedVariables.push('Email')
      else if (key === 'password_e')
        updatedVariables.push('Password')
      else if (key === 'username_e')
        updatedVariables.push('Username')
      else if (key === 'mfaSecret_e')
        return `${input[key as keyof typeof input] ? 'Enabled' : 'Disabled'} MFA`
      else if (key === 'note_e')
        updatedVariables.push('Note')
      else if (key === 'site_e')
        updatedVariables.push('Site')
      else if (key === 'isAutofillEnabled')
        return `${input[key as keyof typeof input] ? 'Enabled' : 'Disabled'} Autofill`
      else if (key === 'isPinned')
        return `${input[key as keyof typeof input] ? 'Pinned Password' : 'Unpinned Password'}`
      else if (key === 'isDeleted')
        return `${input[key as keyof typeof input] ? 'Deleted Password' : 'Restored  Password'}`
      else if (key === 'categoryId')
        updatedVariables.push('Category')
      else if (key === 'iconId')
        updatedVariables.push('Icon')
      else
        updatedVariables.push(key)
    }
  }
  const changelogMessage = `Updated ${updatedVariables.join(', ')}`
  return changelogMessage
}

type MultipartFiles = {
  [key: string]: {
    fieldName: string
    originalFilename: string
    path: string
    headers: { [key: string]: string }
    size: number
  }
}

function parseMultipartyForm(req: Request): Promise<{ files: MultipartFiles }> {
  const form = new multiparty.Form()
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      Object.keys(files).forEach((key) => {
        // eslint-disable-next-line prefer-destructuring
        files[key] = files[key][0]
      })
      resolve({ files })
    })
  })
}