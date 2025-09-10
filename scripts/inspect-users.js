require('dotenv/config')
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, username: true, role: true },
      orderBy: { username: 'asc' }
    })
    console.log('Users:', users)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })

