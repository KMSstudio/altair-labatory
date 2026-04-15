-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('USER', 'PI', 'ADMIN');

-- CreateEnum
CREATE TYPE "pi_application_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECT');

-- CreateEnum
CREATE TYPE "TagKind" AS ENUM ('LAB', 'SUBJECT', 'UNIV', 'TEXT');

-- CreateEnum
CREATE TYPE "EmoteKind" AS ENUM ('CHEER', 'EMPATHY', 'LIKE', 'QUESTION', 'BAD');

-- CreateEnum
CREATE TYPE "EmotePlace" AS ENUM ('ARTICLE', 'COMMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'USER',
    "primary_email" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_credentials" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "provider_user_id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" BIGSERIAL NOT NULL,
    "name_ko" VARCHAR(200) NOT NULL,
    "name_en" VARCHAR(200),
    "country" VARCHAR(100),
    "website_url" VARCHAR(1024),
    "domain" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pi" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "scholar_url" TEXT NOT NULL,
    "user_id" BIGINT,
    "lab_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pi_applications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "requested_name" VARCHAR(100) NOT NULL,
    "lab_id" BIGINT,
    "school_email" VARCHAR(255) NOT NULL,
    "scholar_url" TEXT NOT NULL,
    "note" TEXT,
    "status" "pi_application_status" NOT NULL DEFAULT 'PENDING',
    "decided_by" BIGINT,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pi_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labs" (
    "id" BIGSERIAL NOT NULL,
    "name_ko" VARCHAR(200) NOT NULL,
    "name_en" VARCHAR(200),
    "website_url" VARCHAR(1024),
    "description" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "university_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "labs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" BIGSERIAL NOT NULL,
    "name_ko" VARCHAR(200) NOT NULL,
    "name_en" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_subjects" (
    "lab_id" BIGINT NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_subjects_pkey" PRIMARY KEY ("lab_id","subject_id")
);

-- CreateTable
CREATE TABLE "lab_reviews" (
    "id" BIGSERIAL NOT NULL,
    "lab_id" BIGINT NOT NULL,
    "author_id" BIGINT NOT NULL,
    "content" TEXT NOT NULL,
    "recommend" BOOLEAN NOT NULL,
    "atmos" INTEGER NOT NULL,
    "lectr" INTEGER NOT NULL,
    "paper" INTEGER NOT NULL,
    "salry" INTEGER NOT NULL,
    "persn" INTEGER NOT NULL,
    "visib" "visibility" NOT NULL DEFAULT 'PUBLIC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_review_reports" (
    "id" BIGSERIAL NOT NULL,
    "review_id" BIGINT NOT NULL,
    "reporter_id" BIGINT NOT NULL,
    "reason" VARCHAR(200),
    "detail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_review_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_token" (
    "id" BIGSERIAL NOT NULL,
    "token_hash" TEXT NOT NULL,
    "credential_id" BIGINT,
    "send_email" TEXT NOT NULL,
    "string_val" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "verification_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulletin_board_systems" (
    "id" BIGSERIAL NOT NULL,
    "name_ko" VARCHAR(80) NOT NULL,
    "name_en" VARCHAR(80) NOT NULL,
    "description" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "updated_by" BIGINT,
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
    "author_id" BIGINT,
    "author_ip" VARCHAR(45) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_view_log" (
    "id" BIGSERIAL NOT NULL,
    "article_id" BIGINT NOT NULL,
    "user_id" BIGINT,
    "ip" VARCHAR(45) NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_view_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleHistory" (
    "id" BIGSERIAL NOT NULL,
    "article_id" BIGINT NOT NULL,
    "old_title" TEXT NOT NULL,
    "old_content" TEXT NOT NULL,
    "old_author_ip" VARCHAR(45) NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" BIGSERIAL NOT NULL,
    "article_id" BIGINT NOT NULL,
    "author_id" BIGINT,
    "author_ip" VARCHAR(45) NOT NULL,
    "content" TEXT NOT NULL,
    "parent_id" BIGINT,
    "deleted_at" TIMESTAMP(3),
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentHistory" (
    "id" BIGSERIAL NOT NULL,
    "comment_id" BIGINT NOT NULL,
    "old_content" TEXT NOT NULL,
    "old_author_ip" VARCHAR(45) NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" BIGSERIAL NOT NULL,
    "kind" "TagKind" NOT NULL,
    "lab_id" BIGINT,
    "subj_id" BIGINT,
    "univ_id" BIGINT,
    "text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_tags" (
    "article_id" BIGINT NOT NULL,
    "tag_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_tags_pkey" PRIMARY KEY ("article_id","tag_id")
);

-- CreateTable
CREATE TABLE "emote" (
    "id" BIGSERIAL NOT NULL,
    "kind" "EmoteKind" NOT NULL,
    "place" "EmotePlace" NOT NULL,
    "article_id" BIGINT,
    "comment_id" BIGINT,
    "user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_user_credentials_user_id" ON "user_credentials"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_credentials_email" ON "user_credentials"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_credentials_provider_provider_id_key" ON "user_credentials"("provider", "provider_user_id");

-- CreateIndex
CREATE INDEX "idx_universities_country" ON "universities"("country");

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_ko_key" ON "universities"("name_ko");

-- CreateIndex
CREATE UNIQUE INDEX "pi_user_id_key" ON "pi"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pi_lab_id_key" ON "pi"("lab_id");

-- CreateIndex
CREATE INDEX "idx_pi_name" ON "pi"("name");

-- CreateIndex
CREATE INDEX "idx_pi_applications_status_created" ON "pi_applications"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_pi_applications_user" ON "pi_applications"("user_id");

-- CreateIndex
CREATE INDEX "idx_pi_applications_school_email" ON "pi_applications"("school_email");

-- CreateIndex
CREATE INDEX "idx_labs_name_ko" ON "labs"("name_ko");

-- CreateIndex
CREATE INDEX "idx_labs_university" ON "labs"("university_id");

-- CreateIndex
CREATE INDEX "idx_subjects_is_active" ON "subjects"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_ko_key" ON "subjects"("name_ko");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_en_key" ON "subjects"("name_en");

-- CreateIndex
CREATE INDEX "idx_lab_subjects_subject_lab" ON "lab_subjects"("subject_id", "lab_id");

-- CreateIndex
CREATE INDEX "idx_lab_reviews_lab_created" ON "lab_reviews"("lab_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_lab_reviews_author_created" ON "lab_reviews"("author_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_lab_reviews_recommend" ON "lab_reviews"("recommend");

-- CreateIndex
CREATE INDEX "idx_review_reports_review_created" ON "lab_review_reports"("review_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_review_reports_reporter_created" ON "lab_review_reports"("reporter_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "lab_review_reports_review_id_reporter_id_key" ON "lab_review_reports"("review_id", "reporter_id");

-- CreateIndex
CREATE INDEX "verification_token_token_hash_idx" ON "verification_token"("token_hash");

-- CreateIndex
CREATE INDEX "idx_boards_sort_order" ON "bulletin_board_systems"("sort_order");

-- CreateIndex
CREATE INDEX "idx_board_acls_board_id_action" ON "board_acls"("board_id", "action");

-- CreateIndex
CREATE UNIQUE INDEX "uq_board_acls_board_id_action_role" ON "board_acls"("board_id", "action", "role");

-- CreateIndex
CREATE INDEX "idx_articles_created_at" ON "articles"("created_at");

-- CreateIndex
CREATE INDEX "idx_article_view_log_article_id" ON "article_view_log"("article_id");

-- CreateIndex
CREATE INDEX "idx_article_view_log_viewed_at" ON "article_view_log"("viewed_at");

-- CreateIndex
CREATE INDEX "idx_article_view_log_user_id" ON "article_view_log"("user_id");

-- CreateIndex
CREATE INDEX "idx_comments_article_id_created_at" ON "comments"("article_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_comments_author_id_created_at" ON "comments"("author_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_comments_parent_id_created_at" ON "comments"("parent_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_comments_deleted_at" ON "comments"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "tags_lab_id_key" ON "tags"("lab_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_subj_id_key" ON "tags"("subj_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_univ_id_key" ON "tags"("univ_id");

-- CreateIndex
CREATE INDEX "idx_tags_kind" ON "tags"("kind");

-- CreateIndex
CREATE INDEX "idx_tags_lab_id" ON "tags"("lab_id");

-- CreateIndex
CREATE INDEX "idx_tags_subj_id" ON "tags"("subj_id");

-- CreateIndex
CREATE INDEX "idx_tags_univ_id" ON "tags"("univ_id");

-- CreateIndex
CREATE INDEX "article_tags_tag_id_idx" ON "article_tags"("tag_id");

-- CreateIndex
CREATE INDEX "emote_article_id_comment_id_kind_user_id_idx" ON "emote"("article_id", "comment_id", "kind", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "emote_article_id_comment_id_kind_user_id_key" ON "emote"("article_id", "comment_id", "kind", "user_id");

-- AddForeignKey
ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pi" ADD CONSTRAINT "pi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pi" ADD CONSTRAINT "pi_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pi_applications" ADD CONSTRAINT "pi_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labs" ADD CONSTRAINT "labs_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_subjects" ADD CONSTRAINT "lab_subjects_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_subjects" ADD CONSTRAINT "lab_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_reviews" ADD CONSTRAINT "lab_reviews_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_reviews" ADD CONSTRAINT "lab_reviews_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_review_reports" ADD CONSTRAINT "lab_review_reports_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "lab_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_review_reports" ADD CONSTRAINT "lab_review_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletin_board_systems" ADD CONSTRAINT "bulletin_board_systems_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_acls" ADD CONSTRAINT "board_acls_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "bulletin_board_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "bulletin_board_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_view_log" ADD CONSTRAINT "article_view_log_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_view_log" ADD CONSTRAINT "article_view_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleHistory" ADD CONSTRAINT "ArticleHistory_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentHistory" ADD CONSTRAINT "CommentHistory_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_subj_id_fkey" FOREIGN KEY ("subj_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_univ_id_fkey" FOREIGN KEY ("univ_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emote" ADD CONSTRAINT "emote_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emote" ADD CONSTRAINT "emote_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emote" ADD CONSTRAINT "emote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
