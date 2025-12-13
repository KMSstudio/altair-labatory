
## User

```sql
TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  display_name  VARCHAR(100) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'USER',  -- USER / PI / ADMIN
  primary_email VARCHAR(255) NULL,                    -- 표시/연락용(credential에서 동기화 가능)

  pi_id         BIGINT NULL UNIQUE,                   -- FK -> pi(id), PI면 연결(1:1)

  created_at    TIMESTAMP NOT NULL,
  updated_at    TIMESTAMP NOT NULL
);
```

```sql
TABLE user_credentials (
  id               BIGSERIAL PRIMARY KEY,
  user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  provider         VARCHAR(50) NOT NULL,          -- google / github / kakao ...
  provider_user_id VARCHAR(255) NOT NULL,         -- provider의 sub/uid

  email            VARCHAR(255) NULL,             -- provider가 준 email(없을 수도)
  email_verified   BOOLEAN NOT NULL DEFAULT FALSE,

  is_primary       BOOLEAN NOT NULL DEFAULT FALSE, -- 해당 user의 대표 credential

  created_at       TIMESTAMP NOT NULL,
  updated_at       TIMESTAMP NOT NULL,

  UNIQUE (provider, provider_user_id)
);
```

## Labatory

### PI

```sql
TABLE pi (
  id                 BIGSERIAL PRIMARY KEY,

  name               VARCHAR(100) NOT NULL,
  univ_id            BIGINT NULL,              -- FK -> universities.id (선택)
  default_lab_id     BIGINT NULL,              -- FK -> labs.id (선택)

  google_scholar_url TEXT NOT NULL,

  status             VARCHAR(20) NOT NULL,     -- UNCLAIMED / PENDING / VERIFIED
  user_id            BIGINT NULL UNIQUE REFERENCES users(id),  -- claim된 계정

  created_by         BIGINT NULL REFERENCES users(id),         -- admin or 신청자
  created_at         TIMESTAMP NOT NULL,
  updated_at         TIMESTAMP NOT NULL
);
```

```sql
TABLE pi_applications (
  id                 BIGSERIAL PRIMARY KEY,

  user_id            BIGINT NOT NULL REFERENCES users(id),
  pi_id              BIGINT NULL REFERENCES pi(id),  -- 기존 PI claim이면 세팅

  requested_name     VARCHAR(100) NOT NULL,
  univ_id            BIGINT NULL,
  lab_id             BIGINT NULL,

  school_email       VARCHAR(255) NOT NULL,          -- 새로 추가/검증할 이메일
  google_scholar_url TEXT NOT NULL,
  note               TEXT NULL,

  status             VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING/APPROVED/REJECTED
  decided_by         BIGINT NULL REFERENCES users(id),
  decided_at         TIMESTAMP NULL,

  created_at         TIMESTAMP NOT NULL,
  updated_at         TIMESTAMP NOT NULL
);
```

```sql
TABLE pi_emails (
  id          BIGSERIAL PRIMARY KEY,
  pi_id       BIGINT NOT NULL REFERENCES pi(id) ON DELETE CASCADE,

  email       VARCHAR(255) NOT NULL,
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,

  valid_from  DATE NULL,
  valid_to    DATE NULL,

  created_at  TIMESTAMP NOT NULL,
  updated_at  TIMESTAMP NOT NULL,

  UNIQUE (email),
  UNIQUE (pi_id, email)
);
```
