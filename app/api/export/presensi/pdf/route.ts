import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, assertRole } from '@/lib/auth-helpers'
import fs from 'node:fs/promises'
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
    assertRole(session, ['ADMIN'])
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
        santri: { select: { nama: true } },
      },
      orderBy: { tanggal: 'desc' }
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

    // @ts-ignore - runtime import for pdfkit
    const PDFDocument = (await import('pdfkit')).default || (await import('pdfkit'))
    const doc = new PDFDocument({ size: 'A4', margin: 40 }) as any

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
    // Table header
    doc.fontSize(10).fillColor('#000')
    doc.text('Tanggal', col(0), y)
    doc.text('Santri', col(110), y)
    doc.text('Status', col(300), y)
    doc.text('Catatan', col(370), y)
    y += 16
    doc.moveTo(m.left, y).lineTo(m.left + innerWidth, y).strokeColor('#888').stroke()
    y += 6

    const lineHeight = 14
    const maxY = doc.page.height - m.bottom - 30
    doc.strokeColor('#000')

    for (const r of rows) {
      const tanggal = new Date(r.tanggal).toLocaleDateString('id-ID')
      const santriNamaRow = r.santri?.nama ?? '-'
      const status = r.status
      const cat = r.catatan ?? ''

      if (y > maxY) {
        // Footer halaman sebelumnya
        drawFooter(pageNo)
        // Halaman baru
        doc.addPage()
        pageNo += 1
        y = drawHeader(pageNo)
        doc.fontSize(10)
        doc.text('Tanggal', col(0), y)
        doc.text('Santri', col(110), y)
        doc.text('Status', col(300), y)
        doc.text('Catatan', col(370), y)
        y += 16
        doc.moveTo(m.left, y).lineTo(m.left + innerWidth, y).strokeColor('#888').stroke(); y += 6
      }

      doc.fillColor('#000').fontSize(10)
      doc.text(tanggal, col(0), y, { width: 100 })
      doc.text(santriNamaRow, col(110), y, { width: 180 })
      doc.text(status, col(300), y, { width: 60 })
      doc.text(cat, col(370), y, { width: innerWidth - 370 })
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
