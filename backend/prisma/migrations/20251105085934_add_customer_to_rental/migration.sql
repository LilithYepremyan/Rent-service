/*
  Warnings:

  - You are about to drop the column `userId` on the `Rental` table. All the data in the column will be lost.
  - Added the required column `customer` to the `Rental` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Rental` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Photo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "clothId" INTEGER NOT NULL,
    CONSTRAINT "Photo_clothId_fkey" FOREIGN KEY ("clothId") REFERENCES "Cloth" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Photo" ("clothId", "id", "url") SELECT "clothId", "id", "url" FROM "Photo";
DROP TABLE "Photo";
ALTER TABLE "new_Photo" RENAME TO "Photo";
CREATE TABLE "new_Rental" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "rentDate" DATETIME NOT NULL,
    "clothId" INTEGER NOT NULL,
    "customer" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rental_clothId_fkey" FOREIGN KEY ("clothId") REFERENCES "Cloth" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Rental" ("clothId", "endDate", "id", "rentDate", "startDate", "status") SELECT "clothId", "endDate", "id", "rentDate", "startDate", "status" FROM "Rental";
DROP TABLE "Rental";
ALTER TABLE "new_Rental" RENAME TO "Rental";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Cloth_code_idx" ON "Cloth"("code");

-- CreateIndex
CREATE INDEX "Cloth_status_idx" ON "Cloth"("status");
