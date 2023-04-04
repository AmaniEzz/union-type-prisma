/*
  Warnings:

  - You are about to drop the column `ownerType` on the `Item` table. All the data in the column will be lost.
  - Added the required column `itemType` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "itemType" AS ENUM ('Book', 'Movie');

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "ownerType",
ADD COLUMN     "itemType" "itemType" NOT NULL;

-- DropEnum
DROP TYPE "itemOwnerType";
