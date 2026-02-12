-- CreateEnum
CREATE TYPE "ClothStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'RENTED', 'CLEANING', 'DAMAGED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('CONFIRMED', 'IN_USE', 'RETURNED', 'CANCELED');

-- CreateTable
CREATE TABLE "Cloth" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "ClothStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "Cloth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "clothId" INTEGER NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rental" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rentDate" TIMESTAMP(3) NOT NULL,
    "clothId" INTEGER NOT NULL,
    "customer" JSONB NOT NULL,
    "status" "RentalStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cloth_code_key" ON "Cloth"("code");

-- CreateIndex
CREATE INDEX "Cloth_code_idx" ON "Cloth"("code");

-- CreateIndex
CREATE INDEX "Cloth_status_idx" ON "Cloth"("status");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_clothId_fkey" FOREIGN KEY ("clothId") REFERENCES "Cloth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_clothId_fkey" FOREIGN KEY ("clothId") REFERENCES "Cloth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
