/*
  Warnings:

  - You are about to drop the column `priceAtOrder` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantityOrdered` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `PurchaseOrder` table. All the data in the column will be lost.
  - Added the required column `price` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PurchaseOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("id", "itemName", "orderId") SELECT "id", "itemName", "orderId" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE TABLE "new_PurchaseOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalPrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_PurchaseOrder" ("createdAt", "id") SELECT "createdAt", "id" FROM "PurchaseOrder";
DROP TABLE "PurchaseOrder";
ALTER TABLE "new_PurchaseOrder" RENAME TO "PurchaseOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
