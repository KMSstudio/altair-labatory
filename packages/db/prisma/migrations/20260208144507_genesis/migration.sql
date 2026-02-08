/*
  Warnings:

  - You are about to drop the `Board` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BoardAcl` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PostToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BoardAcl" DROP CONSTRAINT "BoardAcl_boardId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_boardId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_labId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_subjId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_univId_fkey";

-- DropForeignKey
ALTER TABLE "_PostToTag" DROP CONSTRAINT "_PostToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_PostToTag" DROP CONSTRAINT "_PostToTag_B_fkey";

-- DropTable
DROP TABLE "Board";

-- DropTable
DROP TABLE "BoardAcl";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "_PostToTag";

-- CreateTable
CREATE TABLE "bulletin_board_systems" (
    "id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulletin_board_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_acls" (
    "id" BIGSERIAL NOT NULL,
    "board_id" BIGINT NOT NULL,
    "action" TEXT NOT NULL,
    "role" "user_role",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_acls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" BIGSERIAL NOT NULL,
    "board_id" BIGINT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "author_id" BIGINT,
    "author_ip" VARCHAR(45),
    "cheer_count" INTEGER NOT NULL DEFAULT 0,
    "empathy_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "question_count" INTEGER NOT NULL DEFAULT 0,
    "bad_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" BIGSERIAL NOT NULL,
    "type" "TagKind" NOT NULL,
    "lab_id" BIGINT,
    "subj_id" BIGINT,
    "univ_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" BIGSERIAL NOT NULL,
    "article_id" BIGINT NOT NULL,
    "author_id" BIGINT,
    "author_ip" VARCHAR(45),
    "content" TEXT NOT NULL,
    "parent_id" BIGINT,
    "deleted_at" TIMESTAMP(3),
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArticleToTag" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_ArticleToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "bulletin_board_systems_slug_key" ON "bulletin_board_systems"("slug");

-- CreateIndex
CREATE INDEX "idx_boards_sort_order" ON "bulletin_board_systems"("sort_order");

-- CreateIndex
CREATE INDEX "idx_board_acls_board_id_action" ON "board_acls"("board_id", "action");

-- CreateIndex
CREATE UNIQUE INDEX "uq_board_acls_board_id_action_role" ON "board_acls"("board_id", "action", "role");

-- CreateIndex
CREATE INDEX "idx_articles_created_at" ON "articles"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tags_lab_id_key" ON "tags"("lab_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_subj_id_key" ON "tags"("subj_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_univ_id_key" ON "tags"("univ_id");

-- CreateIndex
CREATE INDEX "idx_tags_type" ON "tags"("type");

-- CreateIndex
CREATE INDEX "idx_tags_lab_id" ON "tags"("lab_id");

-- CreateIndex
CREATE INDEX "idx_tags_subj_id" ON "tags"("subj_id");

-- CreateIndex
CREATE INDEX "idx_tags_univ_id" ON "tags"("univ_id");

-- CreateIndex
CREATE INDEX "idx_comments_article_id_created_at" ON "comments"("article_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_comments_author_id_created_at" ON "comments"("author_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_comments_parent_id_created_at" ON "comments"("parent_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_comments_deleted_at" ON "comments"("deleted_at");

-- CreateIndex
CREATE INDEX "_ArticleToTag_B_index" ON "_ArticleToTag"("B");

-- AddForeignKey
ALTER TABLE "board_acls" ADD CONSTRAINT "board_acls_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "bulletin_board_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "bulletin_board_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_subj_id_fkey" FOREIGN KEY ("subj_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_univ_id_fkey" FOREIGN KEY ("univ_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToTag" ADD CONSTRAINT "_ArticleToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToTag" ADD CONSTRAINT "_ArticleToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
