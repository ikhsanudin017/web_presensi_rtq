import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Prefer direct (UNPOOLED) URL for seeding to avoid pool limits/timeouts
const datasourceUrl = process.env.DATABASE_URL
const prisma = new PrismaClient({ datasources: { db: { url: datasourceUrl } } })

async function upsertUser(name: string, email: string, username: string, password: string, role: 'ADMIN'|'USTADZ'|'ORANG_TUA', phone?: string) {
  const hash = await bcrypt.hash(password, 10)
  return prisma.user.upsert({
    where: { email },
    update: { name, username, password: hash, role, phone },
    create: { name, email, username, password: hash, role, phone },
  })
}

async function main() {
  console.log('Seeding users...')
  await upsertUser('Admin RTQ', 'admin@rtq.local', 'admin', 'rumah123.', 'ADMIN')
  await upsertUser('Ustadz Yuliyanto', 'yuliyanto@rtq.local', 'yuliyanto', 'rtq2025', 'USTADZ')
  await upsertUser('Mbak Zulfaa', 'zulfaa@rtq.local', 'zulfaa', 'rtq2025', 'USTADZ')
  await upsertUser('Mas Nofhendri', 'nofhendri@rtq.local', 'nofhendri', 'rtq2025', 'USTADZ')
  const ustYuli = await prisma.user.findUnique({ where: { username: 'yuliyanto' } })
  const ustZul = await prisma.user.findUnique({ where: { username: 'zulfaa' } })

  // Ensure two classes exist and are assigned to ustadz
  async function ensureKelas(nama: string, ustadzId?: string | null) {
    const existing = await prisma.kelas.findFirst({ where: { nama } })
    if (existing) {
      if (existing.ustadzId !== ustadzId) {
        return prisma.kelas.update({ where: { id: existing.id }, data: { ustadzId: ustadzId ?? undefined } })
      }
      return existing
    }
    return prisma.kelas.create({ data: { nama, ustadzId: ustadzId ?? undefined, deskripsi: `Kelas ${nama}` } })
  }

  // Kelas sesuai permintaan: 'Tahfizh' dan 'Iqra'
  const kelasTahfizh = await ensureKelas('Tahfizh', ustYuli?.id)
  const kelasIqra = await ensureKelas('Iqra', ustZul?.id)

  // Santri list provided by user
  const santriList: { nama: string; nis: string }[] = [
    { nama: 'Fatan', nis: '25010001' },
    { nama: 'Abel', nis: '25010002' },
    { nama: 'Faqih', nis: '25010003' },
    { nama: 'Hayyu', nis: '25020004' },
    { nama: 'Miracle', nis: '25020005' },
    { nama: 'Bilqis', nis: '25040006' },
    { nama: 'Dika', nis: '25050007' },
    { nama: 'Rayyan', nis: '25050008' },
    { nama: 'Arin', nis: '25070009' },
    { nama: 'Atha', nis: '25070010' },
  ]

  function slugify(s: string) {
    return s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '')
  }

  console.log('Seeding orang tua & santri...')
  for (const [, s] of santriList.entries()) {
    const slug = slugify(s.nama)
    const parentName = `Ortu ${s.nama}`
    const parentEmail = `ortu${slug}@rtq.local`
    const parentUsername = `ortu${slug}`
    // Password default untuk orang tua
    const parent = await upsertUser(parentName, parentEmail, parentUsername, 'ortu12345', 'ORANG_TUA')
    const isTahfizh = s.nama === 'Atha' || s.nama === 'Faqih'
    const kelasId = isTahfizh ? kelasTahfizh.id : kelasIqra.id
    await prisma.santri.upsert({
      where: { nis: s.nis },
      update: { nama: s.nama, parentId: parent.id, kelasId },
      create: {
        nama: s.nama,
        nis: s.nis,
        parentId: parent.id,
        kelasId,
        alamat: `Alamat ${s.nama}`,
      },
    })
  }

  // Normalisasi nama kelas: gabungkan varian 'tahfid*' menjadi 'Tahfizh' dan varian 'iqra*' menjadi 'Iqra'
  console.log('Menormalkan kelas (Tahfizh/Iqra) ...')
  const allKelas = await prisma.kelas.findMany()
  for (const k of allKelas) {
    const n = k.nama.toLowerCase()
    if (n.includes('tahfid') && k.id !== kelasTahfizh.id) {
      await prisma.santri.updateMany({ where: { kelasId: k.id }, data: { kelasId: kelasTahfizh.id } })
      await prisma.kelas.delete({ where: { id: k.id } })
    } else if (n.includes('iqra') && k.id !== kelasIqra.id) {
      await prisma.santri.updateMany({ where: { kelasId: k.id }, data: { kelasId: kelasIqra.id } })
      await prisma.kelas.delete({ where: { id: k.id } })
    }
  }
  // Bersihkan kelas lama jika ada: "Kelas A" dan "Kelas B"
  console.log('Membersihkan kelas lama (Kelas A/B) ...')
  const oldClasses = await prisma.kelas.findMany({ where: { nama: { in: ['Kelas A', 'Kelas B'] } } })
  if (oldClasses.length) {
    for (const oc of oldClasses) {
      await prisma.santri.updateMany({ where: { kelasId: oc.id }, data: { kelasId: kelasIqra.id } })
    }
    await prisma.kelas.deleteMany({ where: { id: { in: oldClasses.map((c) => c.id) } } })
    console.log(`Dihapus ${oldClasses.length} kelas lama.`)
  }

  // Hapus akun ustadz lama (musyrif1/2) bila masih ada
  await prisma.user.deleteMany({ where: { username: { in: ['musyrif1', 'musyrif2'] } } })

  console.log('Seed selesai.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
