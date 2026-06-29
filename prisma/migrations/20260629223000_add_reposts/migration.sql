CREATE TABLE "Repost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Repost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Repost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Repost_userId_postId_key" ON "Repost"("userId", "postId");
CREATE INDEX "Repost_postId_idx" ON "Repost"("postId");
CREATE INDEX "Repost_userId_idx" ON "Repost"("userId");
CREATE INDEX "Repost_createdAt_idx" ON "Repost"("createdAt");
