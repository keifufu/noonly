import * as z from "zod"
import { SharedCloudFolderPermission } from "@prisma/client"

export const CloudFolderSharePrismaModel = z.object({
  id: z.string(),
  cloudFolderId: z.string(),
  ownerId: z.string(),
  sharedUserId: z.string(),
  isPending: z.boolean(),
  message: z.string().nullish(),
  permission: z.nativeEnum(SharedCloudFolderPermission),
  createdAt: z.date(),
  updatedAt: z.date(),
})
