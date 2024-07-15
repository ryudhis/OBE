/*
  Warnings:

  - You are about to drop the column `periode` on the `MK` table. All the data in the column will be lost.
  - Added the required column `semester` to the `MK` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MK" DROP COLUMN "periode";
ALTER TABLE "MK" ADD COLUMN     "semester" STRING NOT NULL;
