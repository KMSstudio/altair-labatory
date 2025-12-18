-- =========================================================
-- Labatory Database Schema (Consolidated)
-- Postgres SQL
-- =========================================================

-- -------------------------
-- UPDATED_AT TRIGGER HELPER
-- -------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------
-- ENUM TYPES
-- -------------------------
CREATE TYPE user_role AS ENUM ('USER', 'PI', 'ADMIN');
CREATE TYPE pi_status AS ENUM ('UNCLAIMED', 'PENDING', 'VERIFIED');
CREATE TYPE pi_application_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE lab_review_visibility AS ENUM ('PUBLIC', 'PRIVATE');

-- =========================================================
-- USERS / CREDENTIALS
-- =========================================================

-- Purpose: application user profile and role
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  display_name  VARCHAR(100) NOT NULL,
  role          user_role NOT NULL DEFAULT 'USER',
  primary_email VARCHAR(255) NULL,

  pi_id         BIGINT NULL UNIQUE, -- FK -> pi.id (set when verified/linked)

  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Purpose: OAuth identities and verified emails
CREATE TABLE user_credentials (
  id               BIGSERIAL PRIMARY KEY,
  user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  provider         VARCHAR(50) NOT NULL,      -- google / github / kakao ...
  provider_user_id VARCHAR(255) NOT NULL,     -- provider sub/uid

  email            VARCHAR(255) NULL,
  email_verified   BOOLEAN NOT NULL DEFAULT FALSE,

  is_primary       BOOLEAN NOT NULL DEFAULT FALSE,

  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_user_credentials_user_id
  ON user_credentials (user_id);

CREATE INDEX idx_user_credentials_email
  ON user_credentials (email);

CREATE TRIGGER trg_user_credentials_updated_at
BEFORE UPDATE ON user_credentials
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- UNIVERSITIES
-- =========================================================

-- Purpose: University entity referenced by PI and Lab
CREATE TABLE universities (
  id           BIGSERIAL PRIMARY KEY,
  name_ko      VARCHAR(200) NOT NULL,
  name_en      VARCHAR(200),
  country      VARCHAR(100),
  website_url  VARCHAR(1024),

  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (name_ko)
);

CREATE INDEX idx_universities_country
  ON universities (country);

CREATE TRIGGER trg_universities_updated_at
BEFORE UPDATE ON universities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- PI / PI APPLICATIONS / PI EMAILS
-- =========================================================

-- Purpose: PI entity that can be unclaimed, pending, or verified and linked to a user
CREATE TABLE pi (
  id                 BIGSERIAL PRIMARY KEY,

  name               VARCHAR(100) NOT NULL,
  univ_id            BIGINT NULL REFERENCES universities(id) ON DELETE SET NULL,
  default_lab_id     BIGINT NULL, -- FK to labs.id (added later via ALTER TABLE)

  google_scholar_url TEXT NOT NULL,

  status             pi_status NOT NULL DEFAULT 'UNCLAIMED',
  user_id            BIGINT NULL UNIQUE REFERENCES users(id) ON DELETE SET NULL,

  created_by         BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,

  created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pi_name
  ON pi (name);

CREATE INDEX idx_pi_univ
  ON pi (univ_id);

CREATE INDEX idx_pi_status
  ON pi (status);

CREATE TRIGGER trg_pi_updated_at
BEFORE UPDATE ON pi
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Purpose: PI verification/claim request queue (admin approves/rejects)
CREATE TABLE pi_applications (
  id                 BIGSERIAL PRIMARY KEY,

  user_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pi_id              BIGINT NULL REFERENCES pi(id) ON DELETE SET NULL,

  requested_name     VARCHAR(100) NOT NULL,
  univ_id            BIGINT NULL REFERENCES universities(id) ON DELETE SET NULL,
  lab_id             BIGINT NULL, -- FK to labs.id (added later via ALTER TABLE)

  school_email       VARCHAR(255) NOT NULL,
  google_scholar_url TEXT NOT NULL,
  note               TEXT NULL,

  status             pi_application_status NOT NULL DEFAULT 'PENDING',
  decided_by         BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  decided_at         TIMESTAMP NULL,

  created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pi_applications_status_created
  ON pi_applications (status, created_at);

CREATE INDEX idx_pi_applications_user
  ON pi_applications (user_id);

CREATE INDEX idx_pi_applications_pi
  ON pi_applications (pi_id);

CREATE INDEX idx_pi_applications_school_email
  ON pi_applications (school_email);

CREATE TRIGGER trg_pi_applications_updated_at
BEFORE UPDATE ON pi_applications
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Purpose: PI-owned emails (can hold multiple emails, one primary)
CREATE TABLE pi_emails (
  id          BIGSERIAL PRIMARY KEY,
  pi_id       BIGINT NOT NULL REFERENCES pi(id) ON DELETE CASCADE,

  email       VARCHAR(255) NOT NULL,
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,

  valid_from  DATE NULL,
  valid_to    DATE NULL,

  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (email),
  UNIQUE (pi_id, email)
);

CREATE INDEX idx_pi_emails_pi
  ON pi_emails (pi_id);

CREATE TRIGGER trg_pi_emails_updated_at
BEFORE UPDATE ON pi_emails
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- LABS
-- =========================================================

-- Purpose: Lab entity (search by lab/university/subject)
CREATE TABLE labs (
  id            BIGSERIAL PRIMARY KEY,

  name_ko       VARCHAR(200) NOT NULL,
  name_en       VARCHAR(200),
  website_url   VARCHAR(1024),
  description   TEXT,

  university_id BIGINT NULL REFERENCES universities(id) ON DELETE SET NULL,
  pi_id         BIGINT NULL REFERENCES pi(id) ON DELETE SET NULL,

  created_by    BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  updated_by    BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,

  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_labs_name_ko
  ON labs (name_ko);

CREATE INDEX idx_labs_university
  ON labs (university_id);

CREATE INDEX idx_labs_pi
  ON labs (pi_id);

CREATE TRIGGER trg_labs_updated_at
BEFORE UPDATE ON labs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Now that labs exists, wire the deferred FKs in pi and pi_applications
ALTER TABLE pi
  ADD CONSTRAINT fk_pi_default_lab
  FOREIGN KEY (default_lab_id) REFERENCES labs(id)
  ON DELETE SET NULL;

ALTER TABLE pi_applications
  ADD CONSTRAINT fk_pi_applications_lab
  FOREIGN KEY (lab_id) REFERENCES labs(id)
  ON DELETE SET NULL;

-- Also wire users.pi_id -> pi.id (users table was created before pi)
ALTER TABLE users
  ADD CONSTRAINT fk_users_pi
  FOREIGN KEY (pi_id) REFERENCES pi(id)
  ON DELETE SET NULL;

-- =========================================================
-- SUBJECTS / LAB_SUBJECTS
-- =========================================================

-- Purpose: Research subjects (can be merged)
CREATE TABLE subjects (
  id           BIGSERIAL PRIMARY KEY,

  name_ko      VARCHAR(200) NOT NULL,
  name_en      VARCHAR(200),
  description  TEXT,

  is_active    BOOLEAN NOT NULL DEFAULT TRUE,

  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (name_ko)
);

CREATE INDEX idx_subjects_is_active
  ON subjects (is_active);

CREATE TRIGGER trg_subjects_updated_at
BEFORE UPDATE ON subjects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Purpose: Many-to-many relation for lab <-> subject
CREATE TABLE lab_subjects (
  lab_id      BIGINT NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  subject_id  BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,

  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY (lab_id, subject_id)
);

CREATE INDEX idx_lab_subjects_subject_lab
  ON lab_subjects (subject_id, lab_id);

-- =========================================================
-- LAB REVIEWS / REPORTS
-- =========================================================

-- Purpose: Lab reviews written by users
CREATE TABLE lab_reviews (
  id          BIGSERIAL PRIMARY KEY,

  lab_id      BIGINT NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  author_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  title       VARCHAR(200),
  content     TEXT NOT NULL,
  rating      INT NOT NULL,
  visibility  lab_review_visibility NOT NULL DEFAULT 'PUBLIC',

  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT ck_lab_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_lab_reviews_lab_created
  ON lab_reviews (lab_id, created_at);

CREATE INDEX idx_lab_reviews_author_created
  ON lab_reviews (author_id, created_at);

CREATE TRIGGER trg_lab_reviews_updated_at
BEFORE UPDATE ON lab_reviews
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Purpose: Report a review for moderation
CREATE TABLE lab_review_reports (
  id           BIGSERIAL PRIMARY KEY,

  review_id    BIGINT NOT NULL REFERENCES lab_reviews(id) ON DELETE CASCADE,
  reporter_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  reason       VARCHAR(200),
  detail       TEXT,

  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (review_id, reporter_id)
);

CREATE INDEX idx_review_reports_review_created
  ON lab_review_reports (review_id, created_at);

CREATE INDEX idx_review_reports_reporter_created
  ON lab_review_reports (reporter_id, created_at);

-- =========================================================
-- SUBJECT MERGE (EVENT LOG + CANONICAL MAPPING)
-- =========================================================

-- Purpose: Audit log for "from -> to" subject merge actions
CREATE TABLE subject_merge_events (
  id              BIGSERIAL PRIMARY KEY,

  from_subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  to_subject_id   BIGINT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,

  merged_by       BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  note            TEXT,

  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT ck_merge_events_no_self_merge CHECK (from_subject_id <> to_subject_id)
);

CREATE INDEX idx_merge_events_to_created
  ON subject_merge_events (to_subject_id, created_at);

CREATE INDEX idx_merge_events_from_created
  ON subject_merge_events (from_subject_id, created_at);

-- Purpose: Resolve an obsolete subject id to a canonical subject id
CREATE TABLE subject_merge_map (
  from_subject_id BIGINT PRIMARY KEY REFERENCES subjects(id) ON DELETE RESTRICT,
  to_subject_id   BIGINT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,

  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT ck_merge_map_no_self CHECK (from_subject_id <> to_subject_id)
);

CREATE INDEX idx_merge_map_to
  ON subject_merge_map (to_subject_id);
