import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { santriCreateSchema } from '@/lib/validations'
import { requireAuth, assertRole } from '@/lib/auth-helpers'
import { logAudit } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await requireAuth()
    const role = (session.user as any).role
    const userId = (session.user as any).id
    if (role === 'ORANG_TUA') {
      const santri = await prisma.santri.findMany({ where: { parentId: userId }, orderBy: { nama: 'asc' } })
      return NextResponse.json({ santri })
    }
    // USTADZ/ADMIN: semua santri agar filter kelas bisa menampilkan Iqra & Tahfizh
    const santri = await prisma.santri.findMany({ orderBy: { nama: 'asc' } })
    return NextResponse.json({ santri })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN', 'USTADZ'])
    const json = await req.json()
    const data = santriCreateSchema.parse(json)

    // If createParent provided, create user first
    let parentId = data.parentId
    if (!parentId && data.createParent) {
      const hashed = await bcrypt.hash(data.createParent.password, 10)
      const parent = await prisma.user.create({
        data: {
          name: data.createParent.name,
          username: data.createParent.username.toLowerCase(),
          email: data.createParent.email.toLowerCase(),
          password: hashed,
          role: 'ORANG_TUA',
          phone: data.createParent.phone,
        },
      })
      parentId = parent.id
      await logAudit({ userId: (session.user as any).id, action: 'CREATE_USER(ORANG_TUA)', entity: 'User', entityId: parent.id, meta: { email: parent.email } })
    }

    const santri = await prisma.santri.create({
      data: {
        nama: data.nama,
        nis: data.nis,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
        alamat: data.alamat,
        parentId: parentId,
        kelasId: data.kelasId,
      },
    })
    await logAudit({ userId: (session.user as any).id, action: 'CREATE_SANTRI', entity: 'Santri', entityId: santri.id })
    return NextResponse.json({ santri })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}
