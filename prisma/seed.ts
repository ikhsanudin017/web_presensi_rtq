import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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
  await upsertUser('Ustadz Musyrif 1', 'musyrif1@rtq.local', 'musyrif1', 'tahfizh2025', 'USTADZ')
  await upsertUser('Ustadz Musyrif 2', 'musyrif2@rtq.local', 'musyrif2', 'quran2025', 'USTADZ')
  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
