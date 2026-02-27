/*
  Warnings:

  - Added the required column `title` to the `chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chat" ADD COLUMN     "title" TEXT NOT NULL;
