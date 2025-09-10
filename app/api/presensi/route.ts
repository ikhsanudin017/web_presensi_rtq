import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { presensiCreateSchema } from '@/lib/validations'
import { requireAuth, assertRole } from '@/lib/auth-helpers'
import { logAudit } from '@/lib/audit'
import { sendEmail } from '@/lib/notify'

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const santriId = searchParams.get('santriId') || undefined
    const role = (session.user as any).role as 'ADMIN'|'USTADZ'|'ORANG_TUA'
    const userId = (session.user as any).id as string
    const where: any = {}
    if (santriId) where.santriId = santriId

    if (role === 'ORANG_TUA') {
      // Orang tua: hanya anak sendiri
      const children = await prisma.santri.findMany({ where: { parentId: userId }, select: { id: true } })
      where.santriId = { in: children.map(c => c.id) }
    }

    const data = await prisma.presensi.findMany({ where, orderBy: { tanggal: 'desc' } })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN', 'USTADZ'])
    const json = await req.json()
    const data = presensiCreateSchema.parse(json)
    const presensi = await prisma.presensi.create({ data: {
      santriId: data.santriId,
      status: data.status,
      catatan: data.catatan,
      fotoUrl: data.fotoUrl,
      createdBy: (session.user as any).id,
    }})
    // Notifikasi untuk orang tua bila bukan HADIR
    if (presensi.status !== 'HADIR') {
      const santri = await prisma.santri.findUnique({ where: { id: presensi.santriId }, include: { parent: true } })
      if (santri?.parentId) {
        const message = `Ananda ${santri.nama} berstatus ${presensi.status}${presensi.catatan ? `: ${presensi.catatan}` : ''}`
        await prisma.notifikasi.create({ data: {
          userId: santri.parentId,
          type: 'ABSEN',
          title: `Status Presensi: ${presensi.status}`,
          message,
        }})
        if (santri.parent?.email) {
          await sendEmail(santri.parent.email, `Notifikasi Presensi (${presensi.status})`, `<p>${message}</p>`)
        }
      }
    }
    await logAudit({ userId: (session.user as any).id, action: 'CREATE_PRESENSI', entity: 'Presensi', entityId: presensi.id })
    return NextResponse.json({ presensi })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}
