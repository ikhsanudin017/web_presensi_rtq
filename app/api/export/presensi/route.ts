import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, assertRole } from '@/lib/auth-helpers'

function toCSV(rows: any[]) {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const esc = (v: any) => typeof v === 'string' ? '"' + v.replace(/"/g, '""') + '"' : v
  const lines = [headers.join(',')]
  for (const r of rows) lines.push(headers.map(h => esc((r as any)[h] ?? '')).join(','))
  return lines.join('\n')
}

export async function GET() {
  try {
    const session = await requireAuth()
    assertRole(session, ['ADMIN'])
    const rows = await prisma.presensi.findMany({
      select: { id: true, santriId: true, status: true, tanggal: true, catatan: true, createdBy: true },
      orderBy: { tanggal: 'desc' },
    })
    const csv = toCSV(rows)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="presensi.csv"'
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}

