import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import path from 'node:path'
import { promises as fs } from 'node:fs'

export const runtime = 'nodejs'

function startOfMonth(y: number, m: number) { return new Date(y, m - 1, 1, 0, 0, 0, 0) }
function endOfMonth(y: number, m: number) { return new Date(y, m, 0, 23, 59, 59, 999) }

function predikatFromScore(avg: number | null | undefined) {
  const s = Number(avg ?? 0)
  if (s >= 90) return 'Mumtaz'
  if (s >= 80) return 'Jayyid Jiddan'
  if (s >= 70) return 'Jayyid'
  return 'Maqbul'
}

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const santriId = searchParams.get('santriId') || ''
    const month = Number(searchParams.get('month') || '') || (new Date().getMonth() + 1)
    const year = Number(searchParams.get('year') || '') || (new Date().getFullYear())
    const targetHafalan = Number(searchParams.get('targetHafalan') || '') || 10

    if (!santriId) return NextResponse.json({ error: 'santriId wajib' }, { status: 400 })

    const from = startOfMonth(year, month)
    const to = endOfMonth(year, month)

    // Data santri + pembimbing
    const santri = await prisma.santri.findUnique({
      where: { id: santriId },
      select: { id: true, nama: true, nis: true, kelas: { select: { nama: true, ustadz: { select: { name: true } } } } }
    })
    if (!santri) return NextResponse.json({ error: 'Santri tidak ditemukan' }, { status: 404 })

    // Data periode
    const presensi = await prisma.presensi.findMany({
      where: { santriId, tanggal: { gte: from, lte: to } },
      orderBy: { tanggal: 'asc' },
    })
    const evaluasi = await prisma.evaluasi.findMany({
      where: { santriId, tanggal: { gte: from, lte: to } },
      orderBy: { tanggal: 'asc' },
    })
    const hafalan = await prisma.hafalan.findMany({
      where: { santriId, updatedAt: { gte: from, lte: to } },
      orderBy: { updatedAt: 'asc' },
      select: { surah: true, ayatMulai: true, ayatSelesai: true, status: true, updatedAt: true }
    })

    // Ringkasan
    const totalMeet = presensi.length
    const hadir = presensi.filter(p => p.status === 'HADIR').length
    const hadirPct = totalMeet ? Math.round((hadir / totalMeet) * 100) : 0
    const avgEval = evaluasi.length ? Math.round(evaluasi.reduce((a, b) => a + b.nilai, 0) / evaluasi.length) : null
    const predikat = predikatFromScore(avgEval)
    const setoranBaru = hafalan.length
    const selesaiThisMonth = hafalan.filter(h => h.status === 'SELESAI').length
    const progressPct = Math.max(0, Math.min(100, Math.round((selesaiThisMonth / Math.max(1, targetHafalan)) * 100)))

    // PDFKit
    const mod = await import('pdfkit')
    const PDFDocument: any = (mod as any).default || (mod as any)
    const doc = new PDFDocument({ size: 'A4', margin: 40 }) as any

    const buffers: Buffer[] = []
    doc.on('data', (b: Buffer) => buffers.push(b))
    const done = new Promise<Buffer>(resolve => doc.on('end', () => resolve(Buffer.concat(buffers))))

    // Logo
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
    const col = (x: number) => m.left + x

    // Header
    const titleY = 36
    if (logoBuf) doc.image(logoBuf, col(0), titleY, { width: 56 })
    doc.fontSize(14).text("Rumah Tahfizh Quran Ibnu Mas'ud", col(70), titleY, { width: innerWidth - 70, align: 'right' })
    doc.fontSize(9).text('Gempol, Kebondalem, Prambanan–Klaten', col(70), doc.y, { width: innerWidth - 70, align: 'right' })
    doc.moveDown(0.3)
    doc.fontSize(12).text('Laporan Perkembangan Hafalan Ananda', col(70), doc.y, { width: innerWidth - 70, align: 'right' })
    doc.moveTo(m.left, 90).lineTo(m.left + innerWidth, 90).strokeColor('#94a3b8').stroke()

    let y = 104
    const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(from)
    doc.fontSize(11).fillColor('#0f172a').text(`Periode: ${monthLabel}`, col(0), y); y += 8

    // Info santri card
    const cardH = 56
    doc.save().roundedRect(col(0), y, innerWidth, cardH, 8).fill('#f8fafc').restore()
    doc.fontSize(10).fillColor('#0f172a')
    doc.text(`Nama: ${santri.nama}`, col(12), y + 10)
    doc.text(`NIS: ${santri.nis ?? '-'}`, col(12), y + 26)
    doc.text(`Halaqah: ${santri.kelas?.nama ?? '-'}`, col(innerWidth/2), y + 10)
    doc.text(`Pembimbing: ${santri.kelas?.ustadz?.name ?? '-'}`, col(innerWidth/2), y + 26)
    y += cardH + 14

    // Ringkasan kartu (3)
    const badge = (x: number, title: string, value: string, color: string) => {
      const w = (innerWidth - 16) / 3
      const x0 = col(x)
      doc.save().roundedRect(x0, y, w, 64, 10).fillOpacity(0.12).fill(color).restore()
      doc.fontSize(10).fillColor('#0f172a').text(title, x0 + 12, y + 10)
      doc.fontSize(16).fillColor('#0f172a').text(value, x0 + 12, y + 30)
    }
    const w3 = (innerWidth - 16) / 3
    badge(0, 'Kehadiran', `${hadirPct}% (${hadir}/${totalMeet})`, '#2563EB')
    badge(w3 + 8, 'Setoran Baru', `${setoranBaru} entri`, '#38BDF8')
    badge(2 * (w3 + 8), 'Kelancaran', `${predikat}${avgEval ? ` (${avgEval})` : ''}`, '#0EA5E9')
    y += 64 + 16

    // Progress bar hafalan (berdasarkan "SELESAI" bulan ini vs targetHafalan)
    doc.fontSize(11).fillColor('#0f172a').text('Progress Hafalan Bulan Ini', col(0), y); y += 10
    const barW = innerWidth
    const barH = 14
    doc.save().roundedRect(col(0), y, barW, barH, 8).fill('#e5e7eb').restore()
    const progW = Math.round((progressPct / 100) * barW)
    doc.save().roundedRect(col(0), y, Math.max(0, progW), barH, 8).fill('#2563EB').restore()
    doc.fontSize(10).fillColor('#0f172a').text(`${selesaiThisMonth} dari ${targetHafalan} target • ${progressPct}%`, col(0), y - 2, { width: innerWidth, align: 'center' })
    y += barH + 16

    // Tabel Penilaian
    const th = 18
    const tX = col(0)
    const tW = innerWidth
    const c1 = 0, c2 = 220, c3 = 420
    doc.save().rect(tX, y - 4, tW, th).fill('#f0f9ff').restore()
    doc.fontSize(10).fillColor('#0f172a')
    doc.text('Aspek Penilaian', tX + c1, y)
    doc.text('Skor/Predikat', tX + c2, y)
    doc.text('Catatan Singkat', tX + c3, y)
    y += th
    const row = (a: string, b: string, c: string) => {
      doc.fontSize(10).fillColor('#0f172a')
      doc.text(a, tX + c1, y, { width: c2 - c1 - 8 })
      doc.text(b, tX + c2, y, { width: c3 - c2 - 8 })
      doc.text(c, tX + c3, y, { width: tW - c3 })
      y += 16
    }
    const lastNote = evaluasi.filter(e => (e.catatan ?? '').trim().length > 0).slice(-1)[0]?.catatan ?? '-'
    row('Kelancaran Hafalan', `${predikat}${avgEval ? ` (${avgEval})` : ''}`, lastNote)
    row('Tajwid & Makhraj', 'Jayyid Jiddan', 'Perbaiki beberapa tempat qalqalah (opsional)')
    row('Adab & Akhlak', 'Jayyid', 'Disiplin hadir dan sopan santun meningkat (opsional)')
    y += 8

    // Riwayat Bulan Ini – Presensi (ringkas)
    doc.fontSize(12).fillColor('#0f172a').text('Presensi Bulan Ini', tX, y); y += 10
    doc.save().rect(tX, y - 4, tW, th).fill('#f0f9ff').restore()
    doc.fontSize(10).text('Tanggal', tX + 0, y)
    doc.text('Status', tX + 120, y)
    doc.text('Catatan', tX + 200, y)
    y += th
    for (const p of presensi.slice(-24)) {
      doc.fontSize(10).fillColor('#0f172a')
      doc.text(new Date(p.tanggal).toLocaleDateString('id-ID'), tX + 0, y, { width: 110 })
      doc.text(p.status, tX + 120, y, { width: 70 })
      doc.text(p.catatan ?? '', tX + 200, y, { width: innerWidth - 200 })
      y += 14
    }
    y += 10

    // Riwayat Bulan Ini – Setoran Hafalan
    doc.fontSize(12).fillColor('#0f172a').text('Setoran Hafalan Bulan Ini', tX, y); y += 10
    doc.save().rect(tX, y - 4, tW, th).fill('#f0f9ff').restore()
    doc.fontSize(10).text('Tanggal', tX + 0, y)
    doc.text('Surah/Ayat', tX + 120, y)
    doc.text('Status', tX + 300, y)
    y += th
    for (const h of hafalan.slice(-20)) {
      const range = [h.ayatMulai, h.ayatSelesai].filter(Boolean).join('–')
      doc.fontSize(10).fillColor('#0f172a')
      doc.text(new Date(h.updatedAt as any).toLocaleDateString('id-ID'), tX + 0, y, { width: 110 })
      doc.text(`${h.surah}${range ? ` ${range}` : ''}`, tX + 120, y, { width: 170 })
      doc.text(h.status, tX + 300, y, { width: 100 })
      y += 14
    }
    y += 10

    // Riwayat Bulan Ini – Evaluasi
    doc.fontSize(12).fillColor('#0f172a').text('Evaluasi Bulan Ini', tX, y); y += 10
    doc.save().rect(tX, y - 4, tW, th).fill('#f0f9ff').restore()
    doc.fontSize(10).text('Tanggal', tX + 0, y)
    doc.text('Nilai', tX + 120, y)
    doc.text('Catatan', tX + 180, y)
    y += th
    for (const e of evaluasi.slice(-12)) {
      doc.fontSize(10).fillColor('#0f172a')
      doc.text(new Date(e.tanggal).toLocaleDateString('id-ID'), tX + 0, y, { width: 110 })
      doc.text(String(e.nilai), tX + 120, y, { width: 50 })
      doc.text(e.catatan ?? '', tX + 180, y, { width: innerWidth - 180 })
      y += 14
    }

    // Footer
    const inner = innerWidth
    const footer = () => {
      const by = (session.user as any).name || (session.user as any).email || 'RTQ'
      doc.fontSize(9).fillColor('#334155').text('Laporan ini dicetak dari Sistem Informasi Rumah Tahfizh Quran Ibnu Mas\'ud', m.left, doc.page.height - m.bottom + -20, { width: inner, align: 'center' })
      doc.fontSize(9).fillColor('#64748b').text(`Disusun oleh: ${by}`, m.left, doc.page.height - m.bottom + -8, { width: inner, align: 'center' })
    }
    footer()

    doc.end()
    const pdf = await done
    const fname = `laporan-perkembangan-${santri.nama.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-${year}-${String(month).padStart(2,'0')}.pdf`
    return new NextResponse(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${fname}"` } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: 400 })
  }
}

