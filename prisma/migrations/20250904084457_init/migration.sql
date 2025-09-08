-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USTADZ', 'ORANG_TUA');

-- CreateEnum
CREATE TYPE "PresensiStatus" AS ENUM ('HADIR', 'IZIN', 'SAKIT', 'ALPA');

-- CreateEnum
CREATE TYPE "HafalanStatus" AS ENUM ('BARU', 'PROSES', 'SELESAI', 'MURAJAAH');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ABSEN', 'HAFALAN', 'EVALUASI', 'SYSTEM', 'CHAT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "phone" VARCHAR(32),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Santri" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3),
    "alamat" TEXT,
    "parentId" TEXT,
    "kelasId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Santri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kelas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "ustadzId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presensi" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PresensiStatus" NOT NULL,
    "catatan" TEXT,
    "fotoUrl" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Presensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hafalan" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "surah" TEXT NOT NULL,
    "ayatMulai" INTEGER,
    "ayatSelesai" INTEGER,
    "status" "HafalanStatus" NOT NULL DEFAULT 'BARU',
    "targetBulan" TIMESTAMP(3),
    "catatan" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hafalan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluasi" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nilai" INTEGER NOT NULL,
    "catatan" TEXT,
    "pengujiId" TEXT,

    CONSTRAINT "Evaluasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifikasi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Komunikasi" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "santriId" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Komunikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "meta" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Santri_nis_key" ON "Santri"("nis");

-- CreateIndex
CREATE INDEX "Presensi_santriId_tanggal_idx" ON "Presensi"("santriId", "tanggal");

-- CreateIndex
CREATE INDEX "Hafalan_santriId_idx" ON "Hafalan"("santriId");

-- CreateIndex
CREATE INDEX "Notifikasi_userId_read_idx" ON "Notifikasi"("userId", "read");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kelas" ADD CONSTRAINT "Kelas_ustadzId_fkey" FOREIGN KEY ("ustadzId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presensi" ADD CONSTRAINT "Presensi_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presensi" ADD CONSTRAINT "Presensi_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hafalan" ADD CONSTRAINT "Hafalan_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hafalan" ADD CONSTRAINT "Hafalan_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluasi" ADD CONSTRAINT "Evaluasi_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluasi" ADD CONSTRAINT "Evaluasi_pengujiId_fkey" FOREIGN KEY ("pengujiId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Komunikasi" ADD CONSTRAINT "Komunikasi_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Komunikasi" ADD CONSTRAINT "Komunikasi_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Komunikasi" ADD CONSTRAINT "Komunikasi_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
