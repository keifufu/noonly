import { Env } from '../utils/env'
import { prisma } from './prisma'

export async function runCleanupTask() {
  await cleanupExpiredSessions()
  await cleanupPendingDeletedUsers()
  await cleanupExpiredPasswordInvites()
}

async function cleanupExpiredSessions() {
  const refreshTokenExpirationTime = Env.instance.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
  await prisma.session.deleteMany({ where: { updatedAt: { lte: new Date(Date.now() - (refreshTokenExpirationTime * 1000)) } } })
}

async function cleanupPendingDeletedUsers() {
  // TODO: make sure this doesn't get all users, make sure lte only returns users where scheduledDeletion is actually set!
  const scheduledDeletionUsers = prisma.user.findMany({ where: { scheduledDeletion: { lte: new Date() } } })
  // TODO: Delete all user data
  // We will probably need to re-use a lot of code used in other deletion endpoints. maybe put those into services?
  // for shared passwords, gotta make sure the sharedCount updates. (reusing existing delete shared password code should do)
}

async function cleanupExpiredPasswordInvites() {
  // Get all invites with a setupKey and where the createdAt is older than 7 days
  const expiredInvites = await prisma.sharedPassword.findMany({ where: { NOT: { inviteKey: null }, createdAt: { lte: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)) } } })
  expiredInvites.forEach(async (e) => {
    await prisma.sharedPassword.delete({ where: { id: e.id } })
  })
}