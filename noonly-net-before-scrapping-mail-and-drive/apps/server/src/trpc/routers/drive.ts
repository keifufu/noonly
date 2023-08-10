/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DriveFile, SharedDriveFolderPermission } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import crypto from 'node:crypto'
import { arrayToTree } from 'performant-array-to-tree'
import { prisma } from 'src/database/prisma'
import { redis } from 'src/database/redis'
import { R2 } from 'src/utils/R2/R2'
import { z } from 'zod'
import { JwtTwoFactorGuardProcedure } from '../middleware/JwtTwoFactorGuard'
import { router } from '../trpc'
import { verifyPassword } from './auth'

// TODO: figure out how to do multipart uploads
// NOTE: If a file gets renamed to a image, we have to move it to the public bucket
// and vice versa

/*
 * We will rename it to Cloud.
 * We will try to make the client zip the files when downloading multiple / folders.
 *   To do this, we keep sending them new download links that expire in like 5 minutes.
 *
 * Download limits are decided by how many users we'll have.
 * Each user contributes like 0.5$ to the personal limit per month.
 * And 0.5$ to the shared global download limit per month.
 *
 * So, with current download prices at R2 (0.36$ per million downloads)
 * that'd be 44802 downloads per user per day. (global limit)
 *
 * The way to calculate this would be (<userCount> * (0.5$ / (0.36$ / 1000000)))
 * And that would be the number of downloads per month.
 *
 * Uploads should probably also go into this limit. 44802 operations
 * per day should be mooooooore than enough for one user.
 *
 * The global limit is only for shared files downloaded by anonymous users.
 * If a logged-in user downlodas a file, whether shared or personal, it will
 * go towards their personal limit of 0.5$ per month.
 *
 * That means we can allow logged-in users to easily download 44802 files per day.
 * That means we will barely have to worry about users downloading big folders.
 * And anonymous users IN TOTAL can download 44802 files per day.
 *
 * We will have a queue for converting files, which will then get processed by
 * a hetzner server. This queue will need to report the position back to the client.
 *
 * The server will download the first item in the queue, convert it and then reupload it to R2.
 * The server will then repeat this process until the queue is empty.
 *
 * I think we should have a limit of 250MB per file, (based on tier?).
 * For bigger files, such as videos, the user can bother converting them themselves.
 */

/*
 * Used to cache all folders of a user until one is created, deleted or moved,
 * shared or linked. This is because we need to know the `hasLinks` and `sharedCount`
 * This is used to get trees for the sidebar, and for permissions.
 */
type CachedFolders = {
  parentFolderId: string | null;
  id: string;
  name: string;
  hasLink: boolean;
  sharedCount: number;
}[]

class FolderCache {
  private ttl

  constructor(ttlInMinutes = 60) {
    this.ttl = ttlInMinutes * 1000 * 60
  }

  _getKey(userId: string) {
    return `cloud-folders:${userId}`
  }

  async get(userId: string): Promise<CachedFolders | null> {
    const res = await redis.get(this._getKey(userId))
    if (!res)
      return null
    return JSON.parse(res)
  }

  set(userId: string, folders: CachedFolders) {
    // Expires in 1 hour
    redis.set(this._getKey(userId), JSON.stringify(folders), 'EX', this.ttl * 60)
  }

  invalidate(userId: string) {
    redis.del(this._getKey(userId))
  }
}

const folderCache = new FolderCache()

export const driveRouter = router({
  getItemsInFolder: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/drive/get-items-in-folder', tags: ['Drive'], protect: true } })
    .input(z.object({ folderId: z.string(), isDeleted: z.boolean() }))
    .query(async ({ ctx, input }) => {
      const PERM = await hasPermissionsForFolder(input.folderId, { userId: input.folderId })
      if (PERM === SharedDriveFolderPermission.NONE)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You do not have access to this folder' })

      const folders = await prisma.driveFolder.findMany({ where: { userId: ctx.user.id, parentFolderId: input.folderId, isDeleted: input.isDeleted } })
      const files = await prisma.driveFile.findMany({ where: { userId: ctx.user.id, parentFolderId: input.folderId, isDeleted: input.isDeleted } })

      return { folders, files }
    }),
  uploadFile: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/drive/upload-file', tags: ['Drive'], protect: true } })
    .input(z.object({ parentFolderId: z.string(), name: z.string(), size: z.number(), contentType: z.string(), contentLength: z.number() }))
    .query(async ({ ctx, input }) => {
      const existingFile = await prisma.driveFile.findFirst({ where: {
        name: input.name,
        parentFolderId: input.parentFolderId,
        userId: ctx.user.id
      } })
      if (existingFile)
        throw new TRPCError({ code: 'CONFLICT', message: 'File already exists' })

      const r2Key = crypto.webcrypto.randomUUID()
      const usePublicBucket = R2.shouldUsePublicBucket(input.name)

      const { url, method, headers } = await R2.createSignedUploadUrl(r2Key, input.contentLength, input.contentType || 'application/octet-stream', usePublicBucket).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to sign request' })
      })

      const file = await prisma.driveFile.create({
        data: {
          userId: ctx.user.id,
          r2_key: r2Key,
          r2_inPublicBucket: usePublicBucket,
          name: input.name,
          size: input.contentLength
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload File' })
      })

      return {
        file,
        upload: { url, method, headers }
      }
    })
})

// TODO: NOW: how to do multipart uploads so we finally know if we need to implement something differently
// ALSO: if we need the "r2_isUploaded" field or whatever i called it

// TODO: permissions
// TODO: snapshots... maybe..., but maybe only when replacing file? not when renaming or so? probably.
// Uploading the file again will replace the old one on R2. No need to delete it prior to uploading
async function uploadReplacementFile(userId: string, fileId: string, fileSize: number, contentType?: string) {
  const file = await prisma.driveFile.findUnique({ where: { id: fileId, userId } })
  if (!file)
    throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' })

  const { url, method, headers } = await R2.createSignedUploadUrl(file.r2_key, fileSize, contentType || 'application/octet-stream', file.r2_inPublicBucket).catch(() => {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to sign request' })
  })

  return {
    file,
    upload: { url, method, headers }
  }
}

// TODO: permissions
// On conflicts: client will handle adding (1) to the filename, or call uploadReplacementFile instead
async function uploadFile(userId: string, name: string, parentFolderId: string | null, fileSize: number, contentType?: string) {
  const existingFile = await prisma.driveFile.findFirst({ where: { name, parentFolderId, userId } })
  if (existingFile)
    throw new TRPCError({ code: 'CONFLICT', message: 'File already exists' })

  const r2Key = crypto.webcrypto.randomUUID()

  const usePublicBucket = R2.shouldUsePublicBucket(name)

  const { url, method, headers } = await R2.createSignedUploadUrl(r2Key, fileSize, contentType || 'application/octet-stream', usePublicBucket).catch(() => {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to sign request' })
  })

  const file = await prisma.driveFile.create({
    data: {
      userId: userId,
      r2_key: r2Key,
      r2_inPublicBucket: usePublicBucket,
      name: name,
      size: fileSize
    }
  }).catch(() => {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload File' })
  })

  return {
    file,
    upload: { url, method, headers }
  }
}

// We have separate endpoints for renaming, trashing, and deleting files etc.
// because certain actions can be done on multiple files at once

async function renameFile(userId: string, fileId: string, name: string) {
  await checkWritePermissionsForFileIds([fileId], userId)

  const file = await prisma.driveFile.update({
    where: { id: fileId, userId }, data: { name: name }
  }).catch(() => {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to rename File' })
  })

  return file
}

async function setFilesDeleted(userId: string, fileIds: string[], isDeleted: boolean) {
  await checkWritePermissionsForFileIds(fileIds, userId)

  await prisma.driveFile.updateMany({
    where: { id: { in: fileIds }, userId },
    data: {
      isDeleted,
      deletedAt: isDeleted ? new Date() : null
    }
  }).catch(() => {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to move files' })
  })
}

async function moveFiles(userId: string, fileIds: string[], parentFolderId: string) {
  await checkWritePermissionsForFileIds(fileIds, userId)

  await prisma.driveFile.updateMany({
    where: { id: { in: fileIds }, userId },
    data: { parentFolderId }
  }).catch(() => {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to move files' })
  })
}

async function deleteFiles(userId: string, fileIds: string[]) {
  await checkWritePermissionsForFileIds(fileIds, userId)

  // Not using transactions because I cannot undo the deletion of files from R2
  for (const fileId of fileIds) {
    const file = await prisma.driveFile.delete({
      where: { id: fileId, userId }
    }).catch(() => null)
    if (file)
      R2.retryDeleteFile(file.r2_key, file.r2_inPublicBucket)
  }
}

async function getFileDownloadUrl(userId: string, fileId: string) {
  await checkReadPermissionsForFileId(fileId, userId)

  const file = await prisma.driveFile.findUnique({ where: { id: fileId, userId } })
  if (!file)
    throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' })

  if (file.r2_inPublicBucket)
    return R2.getPublicFileUrl(file)
  else
    return await R2.createSignedDownloadUrl(file)
}

// TODO: which parentFolderId this folder should have, also permissions
async function createFolder(userId: string, name: string) {
  const folder = await prisma.driveFolder.create({
    data: { userId: userId, name }
  }).catch(() => {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create Folder' })
  })

  return folder
}

async function setFoldersDeleted(userId: string, folderIds: string[], isDeleted: boolean) {
  await checkWritePermissionsForFolderIds(folderIds, userId)

  await prisma.driveFolder.updateMany({
    where: { id: { in: folderIds }, userId },
    data: {
      isDeleted,
      deletedAt: isDeleted ? new Date() : null
    }
  }).catch(() => {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to move folders' })
  })
}

async function moveFolders(userId: string, folderIds: string[], parentFolderId: string) {
  await checkWritePermissionsForFolderIds(folderIds, userId)

  await prisma.driveFolder.updateMany({
    where: { id: { in: folderIds }, userId },
    data: { parentFolderId }
  }).catch(() => {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to move folders' })
  })
}

async function deleteFolders(userId: string, folderIds: string[]) {
  await checkWritePermissionsForFolderIds(folderIds, userId)

  // TODO: transactions here are sketchy and all because of R2, we cant undo R2 deletions lol
  await prisma.$transaction(async (tx) => {
    await tx.driveFolder.deleteMany({
      where: { id: { in: folderIds } }
    }).catch(() => {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete folders' })
    })

    const deleteFilesInFolder = async (folderId: string) => {
      await prisma.$transaction(async (tx) => {
        const files = await tx.driveFile.findMany({ where: { parentFolderId: folderId } })
        await tx.driveFile.deleteMany({ where: { parentFolderId: folderId } }).catch(() => {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete files' })
        })

        for (const file of files)
          R2.retryDeleteFile(file.r2_key, file.r2_inPublicBucket)
      })
    }

    // TODO: delete files and folders within these folders recursively
    for (const folderId of folderIds) {
      // TODO: userId has to be ownerId, this function can be called by shared users.
      const tree = await getFolderTree(userId, folderId, Infinity)
    }
  })
}

/*
 * Get a folder tree starting from a folderId with a maximum depth.
 *
 * In the future we could get folders with `childrenFolders` recursively,
 * but that might even be slower than this method of getting all folders and
 * sorting them in JS. We'll see.
 * Currently, this takes about 300ms for 5000 folders, and 200ms for 500 folders,
 * when the folders aren't already cached.
 * Otherwise it's almost instant (13ms for 5000, 3ms for 500).
 */
async function getFolderTree(userId: string, folderId: string, depth = 10) {
  let folders: CachedFolders

  const cachedFolders = await folderCache.get(userId)
  if (cachedFolders) {
    folders = cachedFolders
  } else {
    folders = await prisma.driveFolder.findMany({ where: { userId },
      select: { id: true, parentFolderId: true, name: true, hasLink: true, sharedCount: true } })
    folderCache.set(userId, folders)
  }

  const f = folders.find((e) => e.id === folderId)
  if (f) f.parentFolderId = null
  const tree = arrayToTree(folders, { id: 'id', parentId: 'parentFolderId', dataField: null, childrenField: 'childrenFolders' }).find((e) => e.id === folderId)
  if (depth === 0 || depth === null || depth === Infinity) return tree
  const run = (arr: Array<any>, depth: number, currDepth: number) => {
    for (const child of arr) {
      if (currDepth + 1 === depth) child.childrenFolders = []
      else run(child.childrenFolders, depth, currDepth + 1)
    }
  }
  run(tree?.childrenFolders || [], depth, 1)

  return tree
}

const flattenTree = (tree: any) => {
  const res: any[] = []
  const traverse = (node: any) => {
    res.push(node)
    if (node.childrenFolders) {
      for (const child of node.childrenFolders)
        traverse(child)
      node.childrenFolders = []
    }
  }
  traverse(tree)
  return res
}

type CloudLinkInfo = {
  key: string
  password?: string
}

/*
 * Whether or not someone has access to a file based on their userId or a link's key
 * Files can only be accessed by the owner, a shared user, or someone with a link
 */
async function hasPermissionsForFile(fileId: string, { userId, linkInfo } : { userId?: string, linkInfo?: CloudLinkInfo }): Promise<SharedDriveFolderPermission> {
  const file = await prisma.driveFile.findUnique({ where: { id: fileId }, include: { link: true } })
  if (!file) throw new TRPCError({ code: 'BAD_REQUEST', message: 'File not found' })

  // Check if the user is the owner of the file, otherwise check if
  // the user is a shared user of the file or a parent folder
  if (userId) {
    if (file.userId === userId) return SharedDriveFolderPermission.READ_WRITE

    // Get all shared folders between the two users and check if the file is in one of them
    const sharedFolders = await prisma.driveFolderShare.findMany({ where: { ownerId: file.userId, sharedUserId: userId } })
    for (const sharedFolder of sharedFolders) {
      // If this folder is the direct parent of the file, return the permission
      if (file.parentFolderId === sharedFolder.driveFolderId) return sharedFolder.permission
      // Otherwise, check if the file is in a tree of the shared folder
      const flatTree = flattenTree(await getFolderTree(file.userId, sharedFolder.driveFolderId, Infinity))
      if (flatTree.find((e) => e.id === file.parentFolderId)) return sharedFolder.permission
    }
  }

  // If a key is given, check if the file has a link with that key
  // or if a parent folder of the file has a link with that key
  if (linkInfo) {
    // Check link by direct association
    if (file.link?.key === linkInfo.key) {
      if (file.link.hashedPassword) {
        const isValid = await verifyPassword(file.link.hashedPassword, linkInfo.password || '').catch(() => {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Link password is invalid' })
        })
        if (!isValid) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Link password is invalid' })
      }
      return SharedDriveFolderPermission.READ_ONLY
    }
    // Check link by indirect association through a parent folder
    const link = await prisma.cloudLink.findUnique({ where: { key: linkInfo.key } })
    if (!link) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Link not found' })
    if (!link?.driveFolderId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Link not found' })
    if (link.hashedPassword) {
      const isValid = await verifyPassword(link.hashedPassword, linkInfo.password || '').catch(() => {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Link password is invalid' })
      })
      if (!isValid) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Link password is invalid' })
    }
    if (link?.driveFolderId === file.parentFolderId) return SharedDriveFolderPermission.READ_ONLY
    const flatTree = flattenTree(await getFolderTree(file.userId, link?.driveFolderId, Infinity))
    if (flatTree.find((e) => e.id === file.parentFolderId)) return SharedDriveFolderPermission.READ_ONLY
  }

  return SharedDriveFolderPermission.NONE
}

/*
 * Whether or not someone has access to a file based on their userId or a link's key
 * Folders can also be written to by shared users with the WRITE permission
 */
async function hasPermissionsForFolder(folderId: string, { userId, linkInfo } : { userId?: string, linkInfo?: CloudLinkInfo }): Promise<SharedDriveFolderPermission> {
  const folder = await prisma.driveFolder.findUnique({ where: { id: folderId }, include: { link: true, shares: true } })
  if (!folder) throw new TRPCError({ code: 'BAD_REQUEST', message: 'File not found' })

  // Check if the user is the owner of the folder, otherwise check if
  // the user is a shared user of the folder or a parent folder
  if (userId) {
    if (folder.userId === userId) return SharedDriveFolderPermission.READ_WRITE

    // Check if this folder is shared with the user
    const sharedFolder = folder.shares.find((e) => e.sharedUserId === userId)
    if (sharedFolder?.isPending) return SharedDriveFolderPermission.NONE
    if (sharedFolder) return sharedFolder.permission

    // Get all shared folders between the two users and check if the folder is in one of them
    const sharedFolders = await prisma.driveFolderShare.findMany({ where: { ownerId: folder.userId, sharedUserId: userId } })
    for (const sharedFolder of sharedFolders) {
      // If this folder is the direct parent of the folder, return the permission
      if (folder.parentFolderId === sharedFolder.driveFolderId) return sharedFolder.permission
      // Otherwise, check if the folder is in a tree of the shared folder
      const flatTree = flattenTree(await getFolderTree(folder.userId, sharedFolder.driveFolderId, Infinity))
      if (flatTree.find((e) => e.id === folder.parentFolderId)) return sharedFolder.permission
    }
  }

  // If a key is given, check if the folder has a link with that key
  // or if a parent folder of the folder has a link with that key
  if (linkInfo) {
    // Check link by direct association
    if (folder.link?.key === linkInfo.key) {
      if (folder.link.hashedPassword) {
        const isValid = await verifyPassword(folder.link.hashedPassword, linkInfo.password || '').catch(() => {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Link password is invalid' })
        })
        if (!isValid) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Link password is invalid' })
      }
      return SharedDriveFolderPermission.READ_ONLY
    }
    // Check link by indirect association through a parent folder
    const link = await prisma.cloudLink.findUnique({ where: { key: linkInfo.key } })
    if (!link) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Link not found' })
    if (!link?.driveFolderId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Link not found' })
    if (link.hashedPassword) {
      const isValid = await verifyPassword(link.hashedPassword, linkInfo.password || '').catch(() => {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Link password is invalid' })
      })
      if (!isValid) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Link password is invalid' })
    }
    if (link?.driveFolderId === folder.parentFolderId) return SharedDriveFolderPermission.READ_ONLY
    const flatTree = flattenTree(await getFolderTree(folder.userId, link?.driveFolderId, Infinity))
    if (flatTree.find((e) => e.id === folder.parentFolderId)) return SharedDriveFolderPermission.READ_ONLY
  }

  return SharedDriveFolderPermission.NONE
}

/*
 * Checks if a user has READ_WRITE permissions for given folder IDs
 * Throws a TRPCError if the user does not have permissions
 */
async function checkWritePermissionsForFolderIds(folderIds: string[], userId: string) {
  await folderIds.asyncForEach(async (folderId) => {
    const PERM = await hasPermissionsForFolder(folderId, { userId })
    if (PERM !== SharedDriveFolderPermission.READ_WRITE)
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this folder' })
  })
}

/*
 * Checks if a user has READ_WRITE permissions for given file IDs
 * Throws a TRPCError if the user does not have permissions
 */
async function checkWritePermissionsForFileIds(fileIds: string[], userId: string) {
  await fileIds.asyncForEach(async (fileId) => {
    const PERM = await hasPermissionsForFile(fileId, { userId })
    if (PERM !== SharedDriveFolderPermission.READ_WRITE)
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this file' })
  })
}


/*
 * Checks if a user has READ permissions for a given file ID
 * Throws a TRPCError if the user does not have permissions
 */
async function checkReadPermissionsForFileId(fileId: string, userId: string) {
  const PERM = await hasPermissionsForFile(fileId, { userId })
  if (PERM !== SharedDriveFolderPermission.READ_ONLY)
    throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to access this file' })
}


type SnapshotOptions = {
  file: driveFile,
  username: string,
  message: string,

}

/*
 * Creates a snapshot of a file.
 */
async function createFileSnapshot(options: SnapshotOptions) {
  const snapshotR2Key = crypto.webcrypto.randomUUID()
  await R2.copyFile(options.file, snapshotR2Key).catch(() => {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create snapshot' })
  })
  await prisma.driveFile.update({
    where: { id: options.file.id },
    data: {
      changelogs: {
        create: {
          username: options.username,
          message: options.message,
          r2_snapshotKey: snapshotR2Key,
          r2_snapshotSize: options.file.size
        }
      }
    }
  }).catch(() => {
    R2.retryDeleteFile(snapshotR2Key, options.file.r2_inPublicBucket)
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create snapshot' })
  })
}