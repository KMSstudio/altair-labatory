-- CreateTable
CREATE TABLE "UserVerificationToken" (
    "token_hash" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "Expired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "UserVerificationToken_token_hash_key" ON "UserVerificationToken"("token_hash");
