/*
  Warnings:

  - You are about to drop the column `userLimitsId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `UserLimits` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tierUsageId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tierUsageId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userLimitsId_fkey";

-- DropIndex
DROP INDEX "User_userLimitsId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userLimitsId",
ADD COLUMN     "tierUsageId" TEXT NOT NULL;

-- DropTable
DROP TABLE "UserLimits";

-- CreateTable
CREATE TABLE "TierUsage" (
    "id" TEXT NOT NULL,
    "bytesUsed" BIGINT NOT NULL DEFAULT 0,
    "currentPasswords" INTEGER NOT NULL DEFAULT 0,
    "currentCustomIcons" INTEGER NOT NULL DEFAULT 0,
    "currentSubscriptions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TierUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_tierUsageId_key" ON "User"("tierUsageId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tierUsageId_fkey" FOREIGN KEY ("tierUsageId") REFERENCES "TierUsage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
