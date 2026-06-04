-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateIndex
CREATE INDEX "Post_text_idx" ON "Post" USING GIN ("text" gin_trgm_ops);
