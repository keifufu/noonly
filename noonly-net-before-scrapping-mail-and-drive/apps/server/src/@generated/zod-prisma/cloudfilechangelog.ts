import * as z from "zod"

export const CloudFileChangelogPrismaModel = z.object({
  id: z.string(),
  username: z.string(),
  message: z.string(),
  r2_snapshotKey: z.string().nullish(),
  r2_snapshotSize: z.number().int().nullish(),
  name: z.string().nullish(),
  cloudFileId: z.string().nullish(),
  createdAt: z.date(),
})
