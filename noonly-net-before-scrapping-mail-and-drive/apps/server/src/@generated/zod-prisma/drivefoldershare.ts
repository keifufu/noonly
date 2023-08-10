import * as z from "zod"
import { SharedDriveFolderPermission } from "@prisma/client"

export const DriveFolderSharePrismaModel = z.object({
  id: z.string(),
  DriveFolderId: z.string(),
  ownerId: z.string(),
  sharedUserId: z.string(),
  isPending: z.boolean(),
  message: z.string().nullish(),
  permission: z.nativeEnum(SharedDriveFolderPermission),
  createdAt: z.date(),
  updatedAt: z.date(),
})
