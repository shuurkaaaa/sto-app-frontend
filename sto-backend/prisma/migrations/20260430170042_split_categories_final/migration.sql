/*
  Warnings:

  - You are about to drop the column `category` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `min` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Staff` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "StaffCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "InventoryLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryLog_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Inventory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "specifications" TEXT,
    "compatibility" TEXT,
    CONSTRAINT "Inventory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Inventory" ("current", "id", "name", "price") SELECT "current", "id", "name", "price" FROM "Inventory";
DROP TABLE "Inventory";
ALTER TABLE "new_Inventory" RENAME TO "Inventory";
CREATE TABLE "new_Staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "staffCategoryId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'Вільний',
    "earnings" REAL NOT NULL DEFAULT 0.0,
    "currentCar" TEXT DEFAULT '',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Staff_staffCategoryId_fkey" FOREIGN KEY ("staffCategoryId") REFERENCES "StaffCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Staff" ("currentCar", "earnings", "exp", "id", "isDeleted", "name", "role", "status") SELECT "currentCar", "earnings", "exp", "id", "isDeleted", "name", "role", "status" FROM "Staff";
DROP TABLE "Staff";
ALTER TABLE "new_Staff" RENAME TO "Staff";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "StaffCategory_name_key" ON "StaffCategory"("name");
