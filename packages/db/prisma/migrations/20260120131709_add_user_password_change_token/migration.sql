-- CreateTable
CREATE TABLE "UserPasswordChangeToken" (
    "token_hash" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "Expired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPasswordChangeToken_token_hash_key" ON "UserPasswordChangeToken"("token_hash");
