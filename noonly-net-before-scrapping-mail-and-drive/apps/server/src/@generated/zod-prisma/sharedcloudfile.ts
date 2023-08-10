import * as z from "zod"
import { SharedCloudFileRole } from "@prisma/client"
import { CompleteCloudFile, RelatedCloudFilePrismaModel } from "./index"

export const SharedCloudFilePrismaModel = z.object({
  id: z.string(),
  ownerId: z.string(),
  sharedUserId: z.string(),
  isPending: z.boolean(),
  role: z.nativeEnum(SharedCloudFileRole),
  fileId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteSharedCloudFile extends z.infer<typeof SharedCloudFilePrismaModel> {
  file: CompleteCloudFile
}

/**
 * RelatedSharedCloudFilePrismaModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSharedCloudFilePrismaModel: z.ZodSchema<CompleteSharedCloudFile> = z.lazy(() => SharedCloudFilePrismaModel.extend({
  file: RelatedCloudFilePrismaModel,
}))
