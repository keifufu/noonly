-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('Free', 'Unlimited', 'Admin');

-- CreateEnum
CREATE TYPE "SubscriptionBillingPeriod" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "AutofillPersonalInfoGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isEmailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "encKeyStr_e" TEXT NOT NULL,
    "tier" "Tier" NOT NULL DEFAULT 'Free',
    "enableSecurityLogs" BOOLEAN NOT NULL DEFAULT true,
    "enableAdvancedLogs" BOOLEAN NOT NULL DEFAULT false,
    "sendCrashReports" BOOLEAN NOT NULL DEFAULT true,
    "scheduledDeletion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "encryptionKey_e" TEXT NOT NULL,
    "userLimitsId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLimits" (
    "id" TEXT NOT NULL,
    "bytesUsed" BIGINT NOT NULL DEFAULT 0,
    "currentPasswords" INTEGER NOT NULL DEFAULT 0,
    "currentCustomIcons" INTEGER NOT NULL DEFAULT 0,
    "currentSubscriptions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserLimits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "privateKey_e" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "event" TEXT NOT NULL,
    "ipAddress" TEXT,
    "estimatedLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    "ipAddress" TEXT,
    "estimatedLocation" TEXT,
    "hashedRefreshToken" TEXT NOT NULL,
    "isMfaAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Password" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "iconId" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "snapshotOfPasswordId" TEXT,
    "sharedCount" INTEGER NOT NULL DEFAULT 0,
    "isAutofillEnabled" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT,
    "data_e" TEXT NOT NULL,
    "note_e" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Password_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedPassword" (
    "id" TEXT NOT NULL,
    "iconId" TEXT,
    "ownerId" TEXT NOT NULL,
    "ownerUsername" TEXT NOT NULL,
    "sharedUserId" TEXT NOT NULL,
    "sharedUserUsername" TEXT NOT NULL,
    "inviteKey" TEXT,
    "ownerKey_e" TEXT NOT NULL,
    "sharedUserKey_e" TEXT,
    "inviteMessage_e" TEXT,
    "shareNote" BOOLEAN NOT NULL DEFAULT false,
    "name_e" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isAutofillEnabled" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT,
    "data_e" TEXT NOT NULL,
    "ownerNote_e" TEXT,
    "note_e" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "passwordId" TEXT NOT NULL,

    CONSTRAINT "SharedPassword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordChangelog" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "snapshotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ZDONTUSE_passwordId" TEXT NOT NULL,

    CONSTRAINT "PasswordChangelog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordCategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name_e" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordIcon" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordIcon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "data_e" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "billingPeriod" "SubscriptionBillingPeriod" NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutofillCreditCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name_e" TEXT,
    "cardholderName_e" TEXT NOT NULL,
    "cardNumber_e" TEXT NOT NULL,
    "securityCode_e" TEXT NOT NULL,
    "expirationMonth_e" TEXT NOT NULL,
    "expirationYear_e" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutofillCreditCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutofillAddress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name_e" TEXT,
    "street_e" TEXT,
    "city_e" TEXT,
    "state_e" TEXT,
    "zipCode_e" TEXT,
    "country_e" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutofillAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutofillPersonalInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name_e" TEXT,
    "firstName_e" TEXT,
    "lastName_e" TEXT,
    "email_e" TEXT,
    "phone_e" TEXT,
    "gender" "AutofillPersonalInfoGender",
    "birthDay_e" TEXT,
    "birthMonth_e" TEXT,
    "birthYear_e" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutofillPersonalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrlShortener" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isCustomKey" BOOLEAN NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "isTrackingEnabled" BOOLEAN NOT NULL,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "maxClicks" INTEGER,
    "showIntermissionPage" BOOLEAN NOT NULL DEFAULT false,
    "destinationUrl" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrlShortener_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrlShortenerCategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emojiIcon" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrlShortenerCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrlShortenerClick" (
    "id" TEXT NOT NULL,
    "urlShortenerId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL DEFAULT 'unknown',
    "location" TEXT NOT NULL DEFAULT 'unknown',
    "userAgent" TEXT NOT NULL DEFAULT 'unknown',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrlShortenerClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_userLimitsId_key" ON "User"("userLimitsId");

-- CreateIndex
CREATE UNIQUE INDEX "UserKey_userId_key" ON "UserKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserKey_publicKey_key" ON "UserKey"("publicKey");

-- CreateIndex
CREATE UNIQUE INDEX "Session_hashedRefreshToken_key" ON "Session"("hashedRefreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "UrlShortener_key_key" ON "UrlShortener"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UrlShortenerCategory_userId_name_key" ON "UrlShortenerCategory"("userId", "name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userLimitsId_fkey" FOREIGN KEY ("userLimitsId") REFERENCES "UserLimits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKey" ADD CONSTRAINT "UserKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityLog" ADD CONSTRAINT "SecurityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES "PasswordIcon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PasswordCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedPassword" ADD CONSTRAINT "SharedPassword_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES "PasswordIcon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedPassword" ADD CONSTRAINT "SharedPassword_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PasswordCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedPassword" ADD CONSTRAINT "SharedPassword_passwordId_fkey" FOREIGN KEY ("passwordId") REFERENCES "Password"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordChangelog" ADD CONSTRAINT "PasswordChangelog_ZDONTUSE_passwordId_fkey" FOREIGN KEY ("ZDONTUSE_passwordId") REFERENCES "Password"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrlShortener" ADD CONSTRAINT "UrlShortener_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "UrlShortenerCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrlShortenerClick" ADD CONSTRAINT "UrlShortenerClick_urlShortenerId_fkey" FOREIGN KEY ("urlShortenerId") REFERENCES "UrlShortener"("id") ON DELETE CASCADE ON UPDATE CASCADE;
