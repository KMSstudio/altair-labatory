-- AlterTable
ALTER TABLE "articles" ALTER COLUMN "author_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "author_id" DROP NOT NULL;
