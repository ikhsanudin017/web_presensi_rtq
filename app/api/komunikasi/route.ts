import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { komunikasiCreateSchema } from '@/lib/validations'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const withUserId = searchParams.get('with')
    const data = await prisma.komunikasi.findMany({
      where: withUserId ? {
        OR: [
          { fromUserId: (session.user as any).id, toUserId: withUserId },
          { fromUserId: withUserId, toUserId: (session.user as any).id },
        ]
      } : {
        OR: [{ fromUserId: (session.user as any).id }, { toUserId: (session.user as any).id }]
      },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    const json = await req.json()
    const data = komunikasiCreateSchema.parse(json)
    const msg = await prisma.komunikasi.create({ data: {
      fromUserId: (session.user as any).id,
      toUserId: data.toUserId,
      santriId: data.santriId,
      message: data.message,
    }})
    return NextResponse.json({ message: msg })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

