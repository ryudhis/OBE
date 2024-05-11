/*
  Warnings:

  - Added the required column `testing` to the `MK` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MK" ADD COLUMN     "testing" STRING NOT NULL;
