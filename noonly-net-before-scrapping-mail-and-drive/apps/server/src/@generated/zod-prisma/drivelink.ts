import * as z from "zod"

export const DriveLinkPrismaModel = z.object({
  id: z.string(),
  key: z.string(),
  userId: z.string(),
  hashedPassword: z.string().nullish(),
  expirationDate: z.date().nullish(),
  maxDownloads: z.number().int().nullish(),
  downloads: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  DriveFileId: z.string().nullish(),
  DriveFolderId: z.string().nullish(),
})
