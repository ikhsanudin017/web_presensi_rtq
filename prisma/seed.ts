import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123'
  const hashed = await bcrypt.hash(password, 10)
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: 'Administrator', email, password: hashed, role: 'ADMIN' }
  })
  console.log('Seeded admin:', admin.email)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })

