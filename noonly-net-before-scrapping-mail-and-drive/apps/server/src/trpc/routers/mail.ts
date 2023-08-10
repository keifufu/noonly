/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { prisma } from 'src/database/prisma'

async function getFolders(userId: string, addressId: string) {
  const folders = await prisma.mailFolder.findMany({ where: { userId } })
  // count all unread mail in each folder, and return that as well (exclude muted somehow?)
  return folders
}


// we cant afford to fetch all, and then filter objects or something


// TODO: which address to fetch (or all?)
async function getMail(userId: string, folderId: string, start: number, end: number) {
  // Gets simple mail, or nmo
  const mail = await prisma.mail.findMany({ where: { userId, replyToId: null } })

  return mail
}