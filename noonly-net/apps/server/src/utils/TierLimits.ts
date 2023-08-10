import { Tier, type User } from '@prisma/client'
import { z } from 'zod'

export const TierLimitsDTO = z.object({
  global: z.object({
    totalMB: z.number()
  }),
  passwords: z.object({
    maxPasswords: z.number(),
    maxSnapshotsPerPassword: z.number(),
    maxCustomIcons: z.number(),
    canShare: z.boolean()
  }),
  subscriptions: z.object({
    maxSubscriptions: z.number()
  }),
  urlShortener: z.object({
    maxTotalUrls: z.number(),
    maxExpirationDays: z.number(),
    maxActiveCustomUrls: z.number(),
    maxUnlimitedLengthUrls: z.number(),
    clickTracking: z.boolean()
  }),
  screenshots: z.object({
    canUploadGifs: z.boolean()
  })
})

export type TTierLimits = z.infer<typeof TierLimitsDTO>

const Free: TTierLimits = {
  global: {
    totalMB: 20
  },
  urlShortener: {
    maxTotalUrls: 5,
    maxExpirationDays: 7,
    maxActiveCustomUrls: 0,
    maxUnlimitedLengthUrls: 0,
    clickTracking: false
  },
  passwords: {
    maxPasswords: 15,
    maxSnapshotsPerPassword: 2,
    maxCustomIcons: 3,
    canShare: false
  },
  subscriptions: {
    maxSubscriptions: 10
  },
  screenshots: {
    canUploadGifs: false
  }
}

const Premium: TTierLimits = {
  ...Free,
  global: {
    totalMB: 100000
  },
  urlShortener: {
    maxTotalUrls: -1,
    maxExpirationDays: -1,
    maxActiveCustomUrls: -1,
    maxUnlimitedLengthUrls: -1,
    clickTracking: true
  },
  passwords: {
    maxPasswords: -1,
    maxSnapshotsPerPassword: -1,
    maxCustomIcons: -1,
    canShare: true
  },
  subscriptions: {
    maxSubscriptions: -1
  },
  screenshots: {
    canUploadGifs: true
  }
}

const Admin: TTierLimits = {
  ...Premium,
  global: {
    totalMB: 1000000
  },
  urlShortener: {
    maxTotalUrls: -1,
    maxExpirationDays: -1,
    maxActiveCustomUrls: -1,
    maxUnlimitedLengthUrls: -1,
    clickTracking: true
  }
}

const TierLimitLookup: {
  // eslint-disable-next-line no-unused-vars
  [key in Tier]: TTierLimits
} = {
  [Tier.Free]: Free,
  [Tier.Premium]: Premium,
  [Tier.Admin]: Admin
}

export const getUserLimits = (user: User) => TierLimitLookup[user.tier]