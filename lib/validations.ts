import { z } from 'zod'

export const userCreateSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_\.\-]+$/),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'USTADZ', 'ORANG_TUA']),
  phone: z.string().optional(),
})

export const santriCreateSchema = z.object({
  nama: z.string().min(2),
  // NIS: izinkan minimal 1 digit, wajib angka
  nis: z
    .string()
    .min(1, 'NIS minimal 1 digit')
    .regex(/^\d+$/, 'NIS harus berupa angka'),
  tanggalLahir: z.string().optional(),
  alamat: z.string().optional(),
  parentId: z.string().cuid().optional(),
  kelasId: z.string().cuid().optional(),
  createParent: z
    .object({
      name: z.string().min(2),
      username: z.string().min(3).regex(/^[a-zA-Z0-9_\.\-]+$/),
      email: z.string().email(),
      password: z.string().min(6),
      phone: z.string().optional(),
    })
    .optional(),
})

export const presensiCreateSchema = z.object({
  santriId: z.string().cuid(),
  status: z.enum(['HADIR', 'IZIN', 'SAKIT', 'ALPA']),
  catatan: z.string().optional(),
  fotoUrl: z.string().url().optional(),
})

export const hafalanCreateSchema = z.object({
  santriId: z.string().cuid(),
  surah: z.string().min(2),
  ayatMulai: z.number().int().nonnegative().optional(),
  ayatSelesai: z.number().int().nonnegative().optional(),
  status: z.enum(['BARU', 'PROSES', 'SELESAI', 'MURAJAAH']).optional(),
  targetBulan: z.string().optional(),
  catatan: z.string().optional(),
})

export const komunikasiCreateSchema = z.object({
  toUserId: z.string().cuid(),
  santriId: z.string().cuid().optional(),
  message: z.string().min(1),
})

export const evaluasiCreateSchema = z.object({
  santriId: z.string().cuid(),
  nilai: z.number().int().min(0).max(100),
  catatan: z.string().optional(),
  tanggal: z.string().optional(),
})

export const passwordUpdateSchema = z.object({
  password: z.string().min(6)
})
