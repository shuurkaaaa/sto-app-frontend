/*
  Warnings:

  - You are about to drop the column `category` on the `Service` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "PriceCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "time" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER,
    "categoryName" TEXT NOT NULL DEFAULT 'Загальне',
    CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PriceCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Service" ("id", "name", "price", "time") SELECT "id", "name", "price", "time" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PriceCategory_name_key" ON "PriceCategory"("name");
