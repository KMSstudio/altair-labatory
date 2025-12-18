-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('USER', 'PI', 'ADMIN');

-- CreateEnum
CREATE TYPE "pi_status" AS ENUM ('UNCLAIMED', 'PENDING', 'VERIFIED');

-- CreateEnum
CREATE TYPE "pi_application_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "lab_review_visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'USER',
    "primary_email" VARCHAR(255),
    "pi_id" BIGINT,
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
    "email" VARCHAR(255),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pi" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "univ_id" BIGINT,
    "default_lab_id" BIGINT,
    "google_scholar_url" TEXT NOT NULL,
    "status" "pi_status" NOT NULL DEFAULT 'UNCLAIMED',
    "user_id" BIGINT,
    "created_by" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pi_applications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "pi_id" BIGINT,
    "requested_name" VARCHAR(100) NOT NULL,
    "univ_id" BIGINT,
    "lab_id" BIGINT,
    "school_email" VARCHAR(255) NOT NULL,
    "google_scholar_url" TEXT NOT NULL,
    "note" TEXT,
    "status" "pi_application_status" NOT NULL DEFAULT 'PENDING',
    "decided_by" BIGINT,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pi_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pi_emails" (
    "id" BIGSERIAL NOT NULL,
    "pi_id" BIGINT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "valid_from" DATE,
    "valid_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pi_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labs" (
    "id" BIGSERIAL NOT NULL,
    "name_ko" VARCHAR(200) NOT NULL,
    "name_en" VARCHAR(200),
    "website_url" VARCHAR(1024),
    "description" TEXT,
    "university_id" BIGINT,
    "pi_id" BIGINT,
    "created_by" BIGINT,
    "updated_by" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" BIGSERIAL NOT NULL,
    "name_ko" VARCHAR(200) NOT NULL,
    "name_en" VARCHAR(200),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "title" VARCHAR(200),
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "visibility" "lab_review_visibility" NOT NULL DEFAULT 'PUBLIC',
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
CREATE TABLE "subject_merge_events" (
    "id" BIGSERIAL NOT NULL,
    "from_subject_id" BIGINT NOT NULL,
    "to_subject_id" BIGINT NOT NULL,
    "merged_by" BIGINT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subject_merge_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_merge_map" (
    "from_subject_id" BIGINT NOT NULL,
    "to_subject_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subject_merge_map_pkey" PRIMARY KEY ("from_subject_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_pi_id_key" ON "users"("pi_id");

-- CreateIndex
CREATE INDEX "idx_user_credentials_user_id" ON "user_credentials"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_credentials_email" ON "user_credentials"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_credentials_provider_provider_user_id_key" ON "user_credentials"("provider", "provider_user_id");

-- CreateIndex
CREATE INDEX "idx_universities_country" ON "universities"("country");

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_ko_key" ON "universities"("name_ko");

-- CreateIndex
CREATE UNIQUE INDEX "pi_user_id_key" ON "pi"("user_id");

-- CreateIndex
CREATE INDEX "idx_pi_name" ON "pi"("name");

-- CreateIndex
CREATE INDEX "idx_pi_univ" ON "pi"("univ_id");

-- CreateIndex
CREATE INDEX "idx_pi_status" ON "pi"("status");

-- CreateIndex
CREATE INDEX "idx_pi_applications_status_created" ON "pi_applications"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_pi_applications_user" ON "pi_applications"("user_id");

-- CreateIndex
CREATE INDEX "idx_pi_applications_pi" ON "pi_applications"("pi_id");

-- CreateIndex
CREATE INDEX "idx_pi_applications_school_email" ON "pi_applications"("school_email");

-- CreateIndex
CREATE INDEX "idx_pi_emails_pi" ON "pi_emails"("pi_id");

-- CreateIndex
CREATE UNIQUE INDEX "pi_emails_email_key" ON "pi_emails"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pi_emails_pi_id_email_key" ON "pi_emails"("pi_id", "email");

-- CreateIndex
CREATE INDEX "idx_labs_name_ko" ON "labs"("name_ko");

-- CreateIndex
CREATE INDEX "idx_labs_university" ON "labs"("university_id");

-- CreateIndex
CREATE INDEX "idx_labs_pi" ON "labs"("pi_id");

-- CreateIndex
CREATE INDEX "idx_subjects_is_active" ON "subjects"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_ko_key" ON "subjects"("name_ko");

-- CreateIndex
CREATE INDEX "idx_lab_subjects_subject_lab" ON "lab_subjects"("subject_id", "lab_id");

-- CreateIndex
CREATE INDEX "idx_lab_reviews_lab_created" ON "lab_reviews"("lab_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_lab_reviews_author_created" ON "lab_reviews"("author_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_review_reports_review_created" ON "lab_review_reports"("review_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_review_reports_reporter_created" ON "lab_review_reports"("reporter_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "lab_review_reports_review_id_reporter_id_key" ON "lab_review_reports"("review_id", "reporter_id");

-- CreateIndex
CREATE INDEX "idx_merge_events_to_created" ON "subject_merge_events"("to_subject_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_merge_events_from_created" ON "subject_merge_events"("from_subject_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_merge_map_to" ON "subject_merge_map"("to_subject_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_pi_id_fkey" FOREIGN KEY ("pi_id") REFERENCES "pi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pi" ADD CONSTRAINT "pi_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pi" ADD CONSTRAINT "pi_univ_id_fkey" FOREIGN KEY ("univ_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pi" ADD CONSTRAINT "pi_default_lab_id_fkey" FOREIGN KEY ("default_lab_id") REFERENCES "labs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pi_applications" ADD CONSTRAINT "pi_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pi_applications" ADD CONSTRAINT "pi_applications_pi_id_fkey" FOREIGN KEY ("pi_id") REFERENCES "pi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pi_applications" ADD CONSTRAINT "pi_applications_univ_id_fkey" FOREIGN KEY ("univ_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pi_applications" ADD CONSTRAINT "pi_applications_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pi_emails" ADD CONSTRAINT "pi_emails_pi_id_fkey" FOREIGN KEY ("pi_id") REFERENCES "pi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labs" ADD CONSTRAINT "labs_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labs" ADD CONSTRAINT "labs_pi_id_fkey" FOREIGN KEY ("pi_id") REFERENCES "pi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labs" ADD CONSTRAINT "labs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labs" ADD CONSTRAINT "labs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "subject_merge_events" ADD CONSTRAINT "subject_merge_events_from_subject_id_fkey" FOREIGN KEY ("from_subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_merge_events" ADD CONSTRAINT "subject_merge_events_to_subject_id_fkey" FOREIGN KEY ("to_subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_merge_events" ADD CONSTRAINT "subject_merge_events_merged_by_fkey" FOREIGN KEY ("merged_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_merge_map" ADD CONSTRAINT "subject_merge_map_from_subject_id_fkey" FOREIGN KEY ("from_subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_merge_map" ADD CONSTRAINT "subject_merge_map_to_subject_id_fkey" FOREIGN KEY ("to_subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
