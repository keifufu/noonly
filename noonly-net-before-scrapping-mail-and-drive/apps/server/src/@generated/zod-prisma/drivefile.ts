import * as z from "zod"

export const DriveFilePrismaModel = z.object({
  id: z.string(),
  r2_key: z.string(),
  r2_inPublicBucket: z.boolean(),
  r2_uploadComplete: z.boolean(),
  userId: z.string(),
  name: z.string(),
  parentFolderId: z.string().nullish(),
  size: z.number().int(),
  isDeleted: z.boolean(),
  deletedAt: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  hasLink: z.boolean(),
  linkId: z.string().nullish(),
})
