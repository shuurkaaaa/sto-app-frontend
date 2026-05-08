/*
  Warnings:

  - You are about to drop the column `specifications` on the `Inventory` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "TechnicalSpec" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parameter" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "inventoryId" INTEGER NOT NULL,
    CONSTRAINT "TechnicalSpec_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "stockKeepingUnit" TEXT NOT NULL DEFAULT '',
    "current" INTEGER NOT NULL DEFAULT 0,
    "minimum" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER,
    "supplier" TEXT DEFAULT '',
    "imageSource" TEXT,
    "compatibility" TEXT,
    CONSTRAINT "Inventory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Inventory" ("categoryId", "compatibility", "current", "id", "imageSource", "minimum", "name", "price", "stockKeepingUnit", "supplier") SELECT "categoryId", "compatibility", "current", "id", "imageSource", "minimum", "name", "price", "stockKeepingUnit", "supplier" FROM "Inventory";
DROP TABLE "Inventory";
ALTER TABLE "new_Inventory" RENAME TO "Inventory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
