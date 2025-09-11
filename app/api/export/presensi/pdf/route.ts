import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, assertRole } from '@/lib/auth-helpers'
import { promises as fs } from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'

function parseDate(d?: string | null) {
  if (!d) return null
  const nd = new Date(d)
  if (isNaN(nd.getTime())) return null
  return nd
}

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x }
function endOfDay(d: Date) { const x = new Date(d); x.setHours(23,59,59,999); return x }

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
    const defaultFrom = new Date(); defaultFrom.setDate(defaultFrom.getDate()-30)
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

    const rows = await prisma.presensi.findMany({
      where,
      select: {
        tanggal: true,
        status: true,
        catatan: true,
        santri: { select: { nama: true, kelas: { select: { nama: true } } } },
        ustadz: { select: { name: true } },
      },
      orderBy: { tanggal: 'desc' }
    })

    // Evaluasi dalam range/filter yang sama
    const evalWhere: any = { tanggal: { gte, lte } }
    if (santriId) evalWhere.santriId = santriId
    if (ids) evalWhere.santriId = { in: ids }
    const evals = await prisma.evaluasi.findMany({
      where: evalWhere,
      select: {
        tanggal: true,
        nilai: true,
        catatan: true,
        santri: { select: { nama: true } },
      },
      orderBy: { tanggal: 'desc' },
    })

    // Resolve human-readable names for filters
    let kelasNama: string | null = null
    let santriNama: string | null = null
    if (kelasId) {
      const k = await prisma.kelas.findUnique({ where: { id: kelasId }, select: { nama: true } })
      kelasNama = k?.nama ?? kelasId
    }
    if (santriId) {
      const s = await prisma.santri.findUnique({ where: { id: santriId }, select: { nama: true } })
      santriNama = s?.nama ?? santriId
    }

    // Pakai modul Node PDFKit biasa (runtime: nodejs)
    const PDFMod = await import('pdfkit')
    const PDFDocument: any = (PDFMod as any).default || (PDFMod as any)
    const doc = new PDFDocument({ size: 'A4', margin: 40 }) as any
    // Gunakan font default PDFKit; hindari pemanggilan manual font standar agar kompatibel di berbagai env

    const buffers: Buffer[] = []
    doc.on('data', (b: Buffer) => buffers.push(b))
    const done = new Promise<Buffer>(resolve => doc.on('end', () => resolve(Buffer.concat(buffers))))

    // Helpers: header/footer per halaman
    const candidates = [
      path.join(process.cwd(), 'public', 'rtq-logo.png'),
      path.join(process.cwd(), 'public', 'logo.png'),
      path.join(process.cwd(), 'public', 'LOGO RTQ.png'),
      path.join(process.cwd(), 'LOGO RTQ.png'),
    ]
    let logoBuf: Buffer | null = null
    for (const p of candidates) { try { logoBuf = await fs.readFile(p); break } catch {} }

    const m = doc.page.margins
    const innerWidth = doc.page.width - m.left - m.right

    const drawHeader = (pageNo: number) => {
      const topY = 36
      let contentTopY = topY
      // Logo kiri-atas
      if (logoBuf) {
        const w = 56
        const h = w // square-ish
        doc.image(logoBuf, m.left, topY, { width: w })
        contentTopY = Math.max(contentTopY, topY + h)
        // Right block (judul di kanan)
        const rightX = m.left + w + 12
        const rightW = innerWidth - (w + 12)
        doc.fontSize(14).text("RTQ Ibnu Mas'ud", rightX, topY, { width: rightW, align: 'right' })
        doc.fontSize(9).text('Gempol, Kebondalem, Prambanan-Klaten | 150 M dari rel kereta pasar sapi Prambanan', rightX, doc.y, { width: rightW, align: 'right' })
        doc.moveDown(0.2)
        doc.fontSize(12).text('Laporan Presensi', rightX, doc.y, { width: rightW, align: 'right' })
      } else {
        doc.fontSize(16).text("RTQ Ibnu Mas'ud", { align: 'center' })
        doc.fontSize(10).text('Gempol, Kebondalem, Prambanan-Klaten | 150 M dari rel kereta pasar sapi Prambanan', { align: 'center' })
        doc.fontSize(12).text('Laporan Presensi', { align: 'center' })
        contentTopY = doc.y
      }
      const range = `${gte.toLocaleDateString('id-ID')} - ${lte.toLocaleDateString('id-ID')}`
      doc.fontSize(9)
      doc.text(`Periode: ${range}`, m.left, contentTopY + 6, { width: innerWidth, align: 'center' })
      if (kelasNama) doc.text(`Kelas: ${kelasNama}`, { align: 'center' })
      if (santriNama) doc.text(`Santri: ${santriNama}`, { align: 'center' })
      const by = (session.user as any).name || (session.user as any).email || 'Pengguna'
      doc.text(`Disusun oleh: ${by}`, { align: 'center' })
      doc.moveDown(0.3)
      // garis pemisah
      const yLine = doc.y + 6
      doc.moveTo(m.left, yLine).lineTo(m.left + innerWidth, yLine).strokeColor('#888').stroke()
      // return start Y untuk tabel
      return yLine + 10
    }

    const drawFooter = (pageNo: number) => {
      const footerY = doc.page.height - m.bottom + -20
      doc.fontSize(9).fillColor('#444').text(`Halaman ${pageNo}`, m.left, footerY, { width: innerWidth, align: 'center' })
      doc.fillColor('#000')
    }

    // Setup halaman pertama
    let pageNo = 1
    let y = drawHeader(pageNo)
    const col = (x: number) => m.left + x
    // Ringkasan Presensi (badge)
    const totalH = rows.filter(r => r.status === 'HADIR').length
    const totalI = rows.filter(r => r.status === 'IZIN').length
    const totalS = rows.filter(r => r.status === 'SAKIT').length
    const totalA = rows.filter(r => r.status === 'ALPA').length
    doc.fontSize(10).fillColor('#222')
    const badge = (label: string, value: number, color: string, x: number) => {
      const text = `${label}: ${value}`
      doc.roundedRect(col(x), y, 88, 22, 6).fillOpacity(0.12).fill(color).fillOpacity(1)
      doc.fillColor('#000').text(text, col(x)+8, y+6)
    }
    badge('Hadir', totalH, '#16a34a', 0)
    badge('Izin', totalI, '#f59e0b', 96)
    badge('Sakit', totalS, '#fb923c', 192)
    badge('Alpa', totalA, '#ef4444', 288)
    y += 32
    // Header Tabel Presensi
    const cTanggal = 0
    const cSantri = 100
    const cStatus = 280
    const cUstadz = 340
    const cCatatan = 420
    const th = 18
    doc.save().rect(m.left, y - 4, innerWidth, th).fill('#f0f9ff').restore()
    doc.fontSize(10).fillColor('#000')
    doc.text('Tanggal', col(cTanggal), y)
    doc.text('Santri', col(cSantri), y)
    doc.text('Status', col(cStatus), y)
    doc.text('Penginput', col(cUstadz), y)
    doc.text('Catatan', col(cCatatan), y)
    y += th
    doc.moveTo(m.left, y).lineTo(m.left + innerWidth, y).strokeColor('#94a3b8').stroke(); y += 4

    const lineHeight = 14
    const maxY = doc.page.height - m.bottom - 30
    doc.strokeColor('#000')

    // Group rows per hari dengan heading
    const keyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const groupMap = new Map<string, { label: string; items: any[] }>()
    const dayFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })
    for (const r of rows) {
      const d = new Date(r.tanggal)
      const key = keyOf(d)
      const label = dayFmt.format(d)
      if (!groupMap.has(key)) groupMap.set(key, { label, items: [] })
      groupMap.get(key)!.items.push(r)
    }
    const groups = Array.from(groupMap.entries()).map(([k,v]) => ({ key: k, ...v }))
    for (const g of groups) {
      // Section header per hari
      if (y > maxY - 26) { drawFooter(pageNo); doc.addPage(); pageNo += 1; y = drawHeader(pageNo); doc.save().rect(m.left, y - 4, innerWidth, th).fill('#f0f9ff').restore(); doc.fontSize(10); doc.text('Tanggal', col(cTanggal), y); doc.text('Santri', col(cSantri), y); doc.text('Status', col(cStatus), y); doc.text('Penginput', col(cUstadz), y); doc.text('Catatan', col(cCatatan), y); y += th; doc.moveTo(m.left, y).lineTo(m.left + innerWidth, y).strokeColor('#94a3b8').stroke(); y += 4 }
      doc.fontSize(10).fillColor('#0f172a').text(g.label, col(0), y); y += 14
      let zebra = false
      for (const r of g.items) {
        const d = new Date(r.tanggal)
        const tanggal = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        const santriNamaRow = (r as any).santri?.nama ?? '-'
        const status = r.status
        const cat = r.catatan ?? ''
        const ust = (r as any).ustadz?.name ?? '-'

        if (y > maxY) {
          drawFooter(pageNo); doc.addPage(); pageNo += 1; y = drawHeader(pageNo)
          doc.save().rect(m.left, y - 4, innerWidth, th).fill('#f0f9ff').restore();
          doc.fontSize(10); doc.text('Tanggal', col(cTanggal), y); doc.text('Santri', col(cSantri), y); doc.text('Status', col(cStatus), y); doc.text('Penginput', col(cUstadz), y); doc.text('Catatan', col(cCatatan), y)
          y += th; doc.moveTo(m.left, y).lineTo(m.left + innerWidth, y).strokeColor('#94a3b8').stroke(); y += 4
          doc.fontSize(10).fillColor('#0f172a').text(g.label, col(0), y); y += 14
        }

        if (zebra) { doc.save().rect(m.left, y - 2, innerWidth, lineHeight).fill('#f8fafc').restore() }
        zebra = !zebra

        doc.fillColor('#000').fontSize(10)
        doc.text(tanggal, col(cTanggal), y, { width: 100 })
        doc.text(santriNamaRow, col(cSantri), y, { width: 170 })
        doc.text(status, col(cStatus), y, { width: 60 })
        doc.text(ust, col(cUstadz), y, { width: 80 })
        doc.text(cat, col(cCatatan), y, { width: innerWidth - cCatatan })
        y += lineHeight
      }
      y += 6
    }

    // Spacer sebelum Evaluasi
    if (y > maxY - 60) { drawFooter(pageNo); doc.addPage(); pageNo += 1; y = drawHeader(pageNo) }
    y += 8
    doc.fontSize(12).text('Evaluasi', col(0), y)
    y += 16
    doc.fontSize(10)
    doc.save().rect(m.left, y - 4, innerWidth, th).fill('#f0f9ff').restore()
    doc.text('Tanggal', col(0), y)
    doc.text('Santri', col(110), y)
    doc.text('Nilai', col(300), y)
    doc.text('Catatan', col(370), y)
    y += th
    doc.moveTo(m.left, y).lineTo(m.left + innerWidth, y).strokeColor('#94a3b8').stroke(); y += 6

    for (const e of evals) {
      if (y > maxY) { drawFooter(pageNo); doc.addPage(); pageNo += 1; y = drawHeader(pageNo); doc.fontSize(10); doc.text('Tanggal', col(0), y); doc.text('Santri', col(110), y); doc.text('Nilai', col(300), y); doc.text('Catatan', col(370), y); y += 16; doc.moveTo(m.left, y).lineTo(m.left + innerWidth, y).strokeColor('#888').stroke(); y += 6 }
      const tanggal = new Date(e.tanggal).toLocaleDateString('id-ID')
      const sn = (e as any).santri?.nama ?? '-'
      doc.fillColor('#000').fontSize(10)
      doc.text(tanggal, col(0), y, { width: 100 })
      doc.text(sn, col(110), y, { width: 180 })
      doc.text(String(e.nilai), col(300), y, { width: 60 })
      doc.text(e.catatan ?? '', col(370), y, { width: innerWidth - 370 })
      y += lineHeight
    }

    // Footer terakhir
    drawFooter(pageNo)

    doc.end()
    const pdfBuffer = await done
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="presensi-${Date.now()}.pdf"`,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: e.message === 'FORBIDDEN' ? 403 : e.message === 'UNAUTHORIZED' ? 401 : 400 })
  }
}
