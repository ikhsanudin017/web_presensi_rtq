require('dotenv/config')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function main() {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany({
      where: { username: { in: ['yuliyanto', 'zulfaa', 'nofhendri'] } },
      select: { username: true, password: true }
    })
    for (const u of users) {
      const ok = await bcrypt.compare('rtq2025', u.password)
      console.log(u.username, 'match rtq2025?', ok)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })

