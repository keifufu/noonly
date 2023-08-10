import { Tier, User } from '@prisma/client'

interface TierLimit {
  global: {
    totalMB: number
  },
  mail: {
    totalAddressesAndAliases: number
    outgoingMessagesPerDay: number
    maxFolders: number
    maxLabels: number
    maxFilters: number
    autoReply: boolean
    maxCustomDomains: number
    catchAllForCustomDomains: boolean
  }
  passwords: {
    maxPasswords: number
    maxSnapshotsPerPassword: number
    maxCustomIcons: number
    canShare: boolean
  }
  subscriptions: {
    maxSubscriptions: number
  }
  drive: {
    advancedFileSharingTracking: boolean
  }
  urlShortener: {
    // this is todo
    maxTotalUrls: number
    maxExpirationDays: number
    maxActiveCustomUrls: number
    maxUnlimitedLengthUrls: number
    clickTracking: boolean
  }
  fileConverter: {
    // this is todo
    totalFilesInQueue: number
    maxFileSizeMB: number
  }
}

const Free: TierLimit = {
  global: {
    totalMB: 100
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
  }
}

const MailPlus: TierLimit = {
  ...Free,
  global: {
    totalMB: 15000
  }
}

const PasswordsPlus: TierLimit = {
  ...Free,
  passwords: {
    maxPasswords: 150,
    maxSnapshotsPerPassword: 15,
    maxCustomIcons: 50,
    canShare: true
  }
}

const SubscriptionsPlus: TierLimit = {
  ...Free,
  subscriptions: {
    maxSubscriptions: 25
  }
}

const DrivePlus: TierLimit = {
  ...Free,
  global: {
    totalMB: 200000
  }
}

const Unlimited: TierLimit = {
  ...Free,
  global: {
    totalMB: 500000
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
  }
}

const Admin: TierLimit = {
  ...Unlimited,
  global: {
    totalMB: 2500
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
  [key in Tier]: TierLimit
} = {
  [Tier.Free]: Free,
  [Tier.MailPlus]: MailPlus,
  [Tier.PasswordsPlus]: PasswordsPlus,
  [Tier.SubscriptionsPlus]: SubscriptionsPlus,
  [Tier.DrivePlus]: DrivePlus,
  [Tier.Unlimited]: Unlimited,
  [Tier.Admin]: Admin
}

export const getUserLimits = (user: User) => TierLimitLookup[user.tier]