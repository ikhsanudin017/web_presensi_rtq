import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, assertRole } from '@/lib/auth-helpers'

function parseDate(d?: string | null) {
  if (!d) return null
  const nd = new Date(d)
  if (isNaN(nd.getTime())) return null
  return nd
}

function toCSV(rows: any[]) {
  if (rows.length === 0) return '\ufeffTanggal,Santri,Kelas,Status,Catatan' // header saja + BOM
  const headers = Object.keys(rows[0])
  const esc = (v: any) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    // Normalisasi baris baru/spasi agar rapi di Excel
    const clean = s.replace(/\r?\n|\r/g, ' ').trim()
    return '"' + clean.replace(/"/g, '""') + '"'
  }
  const lines = [headers.join(',')]
  for (const r of rows) lines.push(headers.map(h => esc((r as any)[h])).join(','))
  // Tambahkan BOM agar Excel mengenali UTF-8
  return '\ufeff' + lines.join('\n')
}

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    // Izinkan ADMIN dan USTADZ
    assertRole(session, ['ADMIN', 'USTADZ'])

    const { searchParams } = new URL(req.url)
    const from = parseDate(searchParams.get('from'))
    const to = parseDate(searchParams.get('to'))
    const kelasId = searchParams.get('kelasId') || undefined
    const santriId = searchParams.get('santriId') || undefined

    const today = new Date()
    const defaultFrom = new Date(); defaultFrom.setDate(defaultFrom.getDate() - 30)
    const gte = from || defaultFrom
    const lte = to || today

    let ids: string[] | undefined
    if (kelasId && !santriId) {
      const list = await prisma.santri.findMany({ where: { kelasId }, select: { id: true } })
      ids = list.map(s => s.id)
    }

    const where: any = { tanggal: { gte, lte } }
    if (santriId) where.santriId = santriId
    if (ids) where.santriId = { in: ids }

    const rows = await prisma.presensi.findMany({
      where,
      select: {
        tanggal: true,
        status: true,
        catatan: true,
        santri: { select: { nama: true, kelas: { select: { nama: true } } } },
        ustadz: { select: { name: true } },
      },
      orderBy: { tanggal: 'desc' },
    })

    // Bentuk kolom ramah CSV
    const pad2 = (n: number) => (n < 10 ? '0' + n : '' + n)
    const fmt = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
    const mapped = rows.map((r: any) => ({
      Tanggal: fmt(new Date(r.tanggal)),
      Santri: r.santri?.nama ?? '-',
      Kelas: r.santri?.kelas?.nama ?? '-',
      Status: r.status,
      Catatan: r.catatan ?? ''
    }))

    const csv = toCSV(mapped)
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
