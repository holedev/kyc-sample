/*
  Warnings:

  - A unique constraint covering the columns `[content]` on the table `Nickname` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'VERIFIED');

-- CreateTable
CREATE TABLE "InfoKYC" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "sex" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nicknameId" INTEGER,

    CONSTRAINT "InfoKYC_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InfoKYC_code_key" ON "InfoKYC"("code");

-- CreateIndex
CREATE UNIQUE INDEX "InfoKYC_identity_key" ON "InfoKYC"("identity");

-- CreateIndex
CREATE UNIQUE INDEX "InfoKYC_phone_key" ON "InfoKYC"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Nickname_content_key" ON "Nickname"("content");

-- AddForeignKey
ALTER TABLE "InfoKYC" ADD CONSTRAINT "InfoKYC_nicknameId_fkey" FOREIGN KEY ("nicknameId") REFERENCES "Nickname"("id") ON DELETE SET NULL ON UPDATE CASCADE;
