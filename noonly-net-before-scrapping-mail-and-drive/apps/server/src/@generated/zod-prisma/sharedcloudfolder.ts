import * as z from "zod"
import { SharedCloudFolderPermission } from "@prisma/client"

export const SharedCloudFolderPrismaModel = z.object({
  id: z.string(),
  ownerId: z.string(),
  sharedUserId: z.string(),
  inviteMessage: z.string().nullish(),
  isPending: z.boolean(),
  permission: z.nativeEnum(SharedCloudFolderPermission),
  folderId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
