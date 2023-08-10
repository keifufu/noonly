import * as z from "zod"
import { CompleteSubscription, RelatedSubscriptionPrismaModel, CompletePassword, RelatedPasswordPrismaModel, CompleteSharedPassword, RelatedSharedPasswordPrismaModel } from "./index"

export const PasswordDataPrismaModel = z.object({
  id: z.string(),
  site_e: z.string().nullish(),
  username_e: z.string().nullish(),
  email_e: z.string().nullish(),
  password_e: z.string().nullish(),
  mfaSecret_e: z.string().nullish(),
  note_e: z.string().nullish(),
})

export interface CompletePasswordData extends z.infer<typeof PasswordDataPrismaModel> {
  subscriptions: CompleteSubscription[]
  Password: CompletePassword[]
  SharedPassword: CompleteSharedPassword[]
}

/**
 * RelatedPasswordDataPrismaModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPasswordDataPrismaModel: z.ZodSchema<CompletePasswordData> = z.lazy(() => PasswordDataPrismaModel.extend({
  subscriptions: RelatedSubscriptionPrismaModel.array(),
  Password: RelatedPasswordPrismaModel.array(),
  SharedPassword: RelatedSharedPasswordPrismaModel.array(),
}))
