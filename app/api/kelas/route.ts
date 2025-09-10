import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const session = await requireAuth()
    const user = session.user as any
    let kelas
    if (user.role === 'ORANG_TUA') {
      // Kelas dari anak-anaknya
      kelas = await prisma.kelas.findMany({
        where: { santri: { some: { parentId: user.id } } },
        select: { id: true, nama: true },
        orderBy: { nama: 'asc' },
      })
    } else {
      // USTADZ/ADMIN: tampilkan semua kelas agar bisa memilih Iqra/Tahfizh
      kelas = await prisma.kelas.findMany({ select: { id: true, nama: true }, orderBy: { nama: 'asc' } })
    }
    return NextResponse.json({ kelas })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}
