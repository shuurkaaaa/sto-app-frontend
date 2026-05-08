/*
  Warnings:

  - A unique constraint covering the columns `[plate]` on the table `Car` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Car_plate_key" ON "Car"("plate");
