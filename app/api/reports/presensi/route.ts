import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, assertRole } from '@/lib/auth-helpers'

function parseDate(d?: string | null) {
  if (!d) return null
  const nd = new Date(d)
  if (isNaN(nd.getTime())) return null
  return nd
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0,0,0,0)
  return x
}
function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23,59,59,999)
  return x
}

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN'])
    const { searchParams } = new URL(req.url)
    const from = parseDate(searchParams.get('from'))
    const to = parseDate(searchParams.get('to'))
    const kelasId = searchParams.get('kelasId') || undefined
    const santriId = searchParams.get('santriId') || undefined

    const today = new Date()
    const defaultFrom = new Date()
    defaultFrom.setDate(defaultFrom.getDate() - 30)

    const gte = startOfDay(from || defaultFrom)
    const lte = endOfDay(to || today)

    let ids: string[] | undefined
    if (kelasId && !santriId) {
      const list = await prisma.santri.findMany({ where: { kelasId }, select: { id: true } })
      ids = list.map(s => s.id)
    }

    const where: any = { tanggal: { gte, lte } }
    if (santriId) where.santriId = santriId
    if (ids) where.santriId = { in: ids }

    const records = await prisma.presensi.findMany({ where, select: { tanggal: true, status: true } })

    // Build daily buckets
    const buckets = new Map<string, { HADIR: number; IZIN: number; SAKIT: number; ALPA: number }>()
    const cursor = new Date(gte)
    while (cursor <= lte) {
      const key = cursor.toISOString().slice(0,10)
      buckets.set(key, { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
    for (const r of records) {
      const key = new Date(r.tanggal).toISOString().slice(0,10)
      const row = buckets.get(key)
      if (!row) continue
      // @ts-expect-error enum index
      row[r.status]++
    }

    const data = Array.from(buckets.entries()).map(([date, v]) => ({ date, ...v }))
    const totals = records.reduce((acc, cur) => {
      // @ts-expect-error enum index
      acc[cur.status]++
      return acc
    }, { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0 } as any)

    return NextResponse.json({ data, totals })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

