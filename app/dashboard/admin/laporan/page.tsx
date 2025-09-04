import Nav from '@/components/nav'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { type AttendanceDataPoint } from '@/components/charts/attendance-chart'
import ReportExplorer from '@/components/reports/report-explorer'

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0,0,0,0)
  return d
}

export default async function LaporanPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/')
  const since = daysAgo(30)
  const presensi = await prisma.presensi.findMany({ where: { tanggal: { gte: since } }, select: { tanggal: true, status: true } })
  const kelas = await prisma.kelas.findMany({ select: { id: true, nama: true } })
  const santri = await prisma.santri.findMany({ select: { id: true, nama: true, kelasId: true } })

  // ringkas total per status (all-time)
  const [hadir, izin, sakit, alpa] = [
    presensi.filter(p=>p.status==='HADIR').length,
    presensi.filter(p=>p.status==='IZIN').length,
    presensi.filter(p=>p.status==='SAKIT').length,
    presensi.filter(p=>p.status==='ALPA').length,
  ]
  const total = presensi.length || 1

  // build daily data for 30 days
  const byDay = new Map<string, { HADIR: number; IZIN: number; SAKIT: number; ALPA: number }>()
  for (let i=30; i>=0; i--) {
    const d = daysAgo(i)
    const key = d.toISOString().slice(0,10)
    byDay.set(key, { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0 })
  }
  for (const p of presensi) {
    const key = new Date(p.tanggal).toISOString().slice(0,10)
    const row = byDay.get(key)
    if (!row) continue
    // @ts-expect-error index by enum
    row[p.status]++
  }
  const chartData: AttendanceDataPoint[] = Array.from(byDay.entries()).map(([date, v]) => ({ date, ...v }))

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Laporan Presensi</h1>
        <section className="grid md:grid-cols-4 gap-4">
          <Stat title="Hadir" value={hadir} color="bg-green-500" />
          <Stat title="Izin" value={izin} color="bg-yellow-500" />
          <Stat title="Sakit" value={sakit} color="bg-orange-500" />
          <Stat title="Alpa" value={alpa} color="bg-red-500" />
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Grafik 30 Hari Terakhir</h2>
          <ReportExplorer initialData={chartData} kelas={kelas} santri={santri} />
        </section>
        <section>
          <a className="px-3 py-2 rounded border inline-block" href="/api/export/presensi">Export CSV</a>
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
