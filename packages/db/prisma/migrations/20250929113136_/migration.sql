/*
  Warnings:

  - You are about to drop the column `ranking` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Player" DROP COLUMN "ranking",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;
