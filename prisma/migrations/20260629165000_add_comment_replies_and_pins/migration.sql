ALTER TABLE "Comment" ADD COLUMN "parentId" TEXT;
ALTER TABLE "Comment" ADD COLUMN "isPinned" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
CREATE INDEX "Comment_postId_isPinned_idx" ON "Comment"("postId", "isPinned");
