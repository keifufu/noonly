import * as z from "zod"

export const DriveFileChangelogPrismaModel = z.object({
  id: z.string(),
  username: z.string(),
  message: z.string(),
  r2_snapshotKey: z.string().nullish(),
  r2_snapshotSize: z.number().int().nullish(),
  name: z.string().nullish(),
  DriveFileId: z.string().nullish(),
  createdAt: z.date(),
})
