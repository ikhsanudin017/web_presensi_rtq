import Nav from '@/components/nav'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ChartModeToggle from '@/components/charts/chart-mode-toggle'
import type { AttendanceDataPoint } from '@/components/charts/attendance-chart'

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x }
function endOfDay(d: Date) { const x = new Date(d); x.setHours(23,59,59,999); return x }

export default async function UstadzLaporanPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.role !== 'USTADZ') {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="p-6 max-w-5xl mx-auto">
          <p className="text-gray-600">Akses laporan ini khusus untuk Pengajar.</p>
        </main>
      </div>
    )
  }

  // Range 30 hari terakhir khusus presensi yang diinput oleh ustadz ini
  const today = new Date()
  const from = new Date(); from.setDate(today.getDate()-30)
  const gte = startOfDay(from)
  const lte = endOfDay(today)

  const records = await prisma.presensi.findMany({
    where: { createdBy: user.id, tanggal: { gte, lte } },
    select: { tanggal: true, status: true },
    orderBy: { tanggal: 'asc' }
  })

  // Bucket harian
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
    row[r.status]++
  }
  const data: AttendanceDataPoint[] = Array.from(buckets.entries()).map(([date, v]) => ({ date, ...v }))
  const totals = records.reduce((acc, cur) => { acc[cur.status]++; return acc }, { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0 } as any)

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Laporan Presensi (Pengajar)</h1>

        <section className="grid md:grid-cols-4 gap-4">
          <Stat title="Hadir" value={totals.HADIR} color="bg-green-500" />
          <Stat title="Izin" value={totals.IZIN} color="bg-yellow-500" />
          <Stat title="Sakit" value={totals.SAKIT} color="bg-orange-500" />
          <Stat title="Alpa" value={totals.ALPA} color="bg-red-500" />
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Grafik 30 Hari Terakhir</h2>
          <ChartModeToggle data={data} />
        </section>
      </main>
    </div>
  )
}

function Stat({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="border rounded p-4">
      <div className="text-sm opacity-75">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className={`mt-2 h-1 w-10 ${color}`} />
    </div>
  )
}
