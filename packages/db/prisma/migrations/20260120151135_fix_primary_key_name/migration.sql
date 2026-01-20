/*
  Warnings:

  - You are about to drop the column `user_id` on the `UserPasswordChangeToken` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `UserVerificationToken` table. All the data in the column will be lost.
  - Added the required column `credential_id` to the `UserPasswordChangeToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credential_id` to the `UserVerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserPasswordChangeToken" DROP COLUMN "user_id",
ADD COLUMN     "credential_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "UserVerificationToken" DROP COLUMN "user_id",
ADD COLUMN     "credential_id" BIGINT NOT NULL;
