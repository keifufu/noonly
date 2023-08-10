import * as z from "zod"

export const CloudFolderInvitePrismaModel = z.object({
  id: z.string(),
  cloudFolderId: z.string(),
  message: z.string(),
})
