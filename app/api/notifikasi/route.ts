import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const session = await requireAuth()
    const data = await prisma.notifikasi.findMany({ where: { userId: (session.user as any).id }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

export async function PATCH() {
  try {
    const session = await requireAuth()
    await prisma.notifikasi.updateMany({ where: { userId: (session.user as any).id, read: false }, data: { read: true } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

