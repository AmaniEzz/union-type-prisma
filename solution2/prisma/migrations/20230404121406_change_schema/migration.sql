/*
  Warnings:

  - The primary key for the `Book` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `serialNumber` on the `Book` table. All the data in the column will be lost.
  - The `id` column on the `Book` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Item` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `amount` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `itemType` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Item` table. All the data in the column will be lost.
  - The `id` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Movie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `director` on the `Movie` table. All the data in the column will be lost.
  - The `id` column on the `Movie` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `ownerId` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerType` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "itemOwnerType" AS ENUM ('Book', 'Movie');

-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_id_fkey";

-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_id_fkey";

-- DropIndex
DROP INDEX "Book_id_key";

-- DropIndex
DROP INDEX "Item_id_key";

-- DropIndex
DROP INDEX "Movie_id_key";

-- AlterTable
ALTER TABLE "Book" DROP CONSTRAINT "Book_pkey",
DROP COLUMN "serialNumber",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Book_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Item" DROP CONSTRAINT "Item_pkey",
DROP COLUMN "amount",
DROP COLUMN "itemType",
DROP COLUMN "price",
ADD COLUMN     "ownerId" INTEGER NOT NULL,
ADD COLUMN     "ownerType" "itemOwnerType" NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Item_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_pkey",
DROP COLUMN "director",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Movie_pkey" PRIMARY KEY ("id");
