import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { santriCreateSchema } from '@/lib/validations'
import { requireAuth, assertRole } from '@/lib/auth-helpers'
import { logAudit } from '@/lib/audit'

export async function GET() {
  try {
    const session = await requireAuth()
    const role = (session.user as any).role
    if (role === 'ORANG_TUA') {
      const santri = await prisma.santri.findMany({ where: { parentId: (session.user as any).id }, orderBy: { nama: 'asc' } })
      return NextResponse.json({ santri })
    }
    const santri = await prisma.santri.findMany({ orderBy: { nama: 'asc' } })
    return NextResponse.json({ santri })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN'])
    const json = await req.json()
    const data = santriCreateSchema.parse(json)
    const santri = await prisma.santri.create({ data: {
      nama: data.nama,
      nis: data.nis,
      tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
      alamat: data.alamat,
      parentId: data.parentId,
      kelasId: data.kelasId,
    }})
    await logAudit({ userId: (session.user as any).id, action: 'CREATE_SANTRI', entity: 'Santri', entityId: santri.id })
    return NextResponse.json({ santri })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

