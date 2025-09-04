import { z } from 'zod'

export const userCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'USTADZ', 'ORANG_TUA']),
  phone: z.string().optional(),
})

export const santriCreateSchema = z.object({
  nama: z.string().min(2),
  nis: z.string().min(3),
  tanggalLahir: z.string().optional(),
  alamat: z.string().optional(),
  parentId: z.string().uuid().optional(),
  kelasId: z.string().uuid().optional(),
})

export const presensiCreateSchema = z.object({
  santriId: z.string().uuid(),
  status: z.enum(['HADIR', 'IZIN', 'SAKIT', 'ALPA']),
  catatan: z.string().optional(),
  fotoUrl: z.string().url().optional(),
})

export const hafalanCreateSchema = z.object({
  santriId: z.string().uuid(),
  surah: z.string().min(2),
  ayatMulai: z.number().int().nonnegative().optional(),
  ayatSelesai: z.number().int().nonnegative().optional(),
  status: z.enum(['BARU', 'PROSES', 'SELESAI', 'MURAJAAH']).optional(),
  targetBulan: z.string().optional(),
  catatan: z.string().optional(),
})

export const komunikasiCreateSchema = z.object({
  toUserId: z.string().uuid(),
  santriId: z.string().uuid().optional(),
  message: z.string().min(1),
})

export const evaluasiCreateSchema = z.object({
  santriId: z.string().uuid(),
  nilai: z.number().int().min(0).max(100),
  catatan: z.string().optional(),
  tanggal: z.string().optional(),
})
