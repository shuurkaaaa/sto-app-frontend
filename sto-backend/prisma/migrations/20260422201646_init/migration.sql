/*
  Warnings:

  - You are about to drop the `ServiceParts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `price` on the `Part` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Part` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Part` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - Added the required column `serviceId` to the `Part` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ServiceParts";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Part" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    CONSTRAINT "Part_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Part" ("id", "name") SELECT "id", "name" FROM "Part";
DROP TABLE "Part";
ALTER TABLE "new_Part" RENAME TO "Part";
CREATE TABLE "new_Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL
);
INSERT INTO "new_Service" ("id", "name", "price") SELECT "id", "name", "price" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
