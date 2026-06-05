-- AlterTable: a generated column kept in sync with `text` by Postgres, so the
-- search vector never drifts and needs no trigger or application code.
ALTER TABLE "Post" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce("text", ''))) STORED;

-- CreateIndex
CREATE INDEX "Post_searchVector_idx" ON "Post" USING GIN ("searchVector");
