-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "important" BOOLEAN NOT NULL DEFAULT false,
    "date" DATETIME,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "deadline" DATETIME,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurRule" TEXT,
    "recurGroupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("createdAt", "date", "deadline", "endTime", "id", "important", "isRecurring", "note", "recurGroupId", "recurRule", "startTime", "status", "title", "updatedAt", "userId") SELECT "createdAt", "date", "deadline", "endTime", "id", "important", "isRecurring", "note", "recurGroupId", "recurRule", "startTime", "status", "title", "updatedAt", "userId" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
