/*
  Warnings:

  - Added the required column `amount` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL;
