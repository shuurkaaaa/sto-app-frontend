-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Прямий візит',
    "notes" TEXT,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "lastVisit" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Customer" ("id", "lastVisit", "name", "notes", "phone", "source", "totalSpent") SELECT "id", "lastVisit", "name", "notes", "phone", "source", "totalSpent" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
