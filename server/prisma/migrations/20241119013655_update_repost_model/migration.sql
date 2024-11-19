/*
  Warnings:

  - You are about to drop the column `originalPostId` on the `Repost` table. All the data in the column will be lost.
  - You are about to drop the column `originalUserId` on the `Repost` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Repost_originalPostId_key";

-- DropIndex
DROP INDEX "Repost_originalUserId_key";

-- AlterTable
ALTER TABLE "Repost" DROP COLUMN "originalPostId",
DROP COLUMN "originalUserId";
