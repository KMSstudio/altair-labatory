/*
  Warnings:

  - You are about to drop the column `type` on the `tags` table. All the data in the column will be lost.
  - Added the required column `kind` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "idx_tags_type";

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "type",
ADD COLUMN     "kind" "TagKind" NOT NULL;

-- CreateIndex
CREATE INDEX "idx_tags_type" ON "tags"("kind");
