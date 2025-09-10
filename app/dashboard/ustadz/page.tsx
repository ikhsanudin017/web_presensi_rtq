import Nav from '@/components/nav'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import StatCard from '@/components/StatCard'
import AttendanceChart, { type AttendancePoint } from '@/components/AttendanceChart'
import ChartModeToggle from '@/components/charts/chart-mode-toggle'
import type { AttendanceDataPoint } from '@/components/charts/attendance-chart'
import { Users, CheckCircle, BookOpen, Bell } from 'lucide-react'

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
}

export default async function UstadzDashboard() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.role !== 'USTADZ') {
    // Keep it simple: let middleware handle redirect, or show minimal guard
    return (
      <div className="p-8 text-center text-gray-600">Akses hanya untuk Pengajar.</div>
    )
  }

  const now = new Date()
  const sod = startOfDay(now)
  const eod = endOfDay(now)
  const last7 = new Date(now)
  last7.setDate(now.getDate() - 6)
  last7.setHours(0, 0, 0, 0)
  const from30 = new Date(now)
  from30.setDate(now.getDate() - 29)
  from30.setHours(0,0,0,0)

  // Jalankan query secara berurutan untuk mengurangi penggunaan koneksi simultan
  const totalSantri = await prisma.santri.count({ where: { kelas: { ustadzId: user.id } } })
  const todayHadir = await prisma.presensi.count({ where: { createdBy: user.id, tanggal: { gte: sod, lt: eod }, status: 'HADIR' } })
  const hafalanMingguIni = await prisma.hafalan.count({ where: { updatedBy: user.id, updatedAt: { gte: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) } } })
  const unreadNotif = await prisma.notifikasi.count({ where: { userId: user.id, read: false } })
  const recentPresensi = await prisma.presensi.findMany({
    where: { createdBy: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { santri: { select: { nama: true } } },
  })
  const rawPresensi = await prisma.presensi.findMany({
    where: { createdBy: user.id, tanggal: { gte: last7 } },
    select: { tanggal: true, status: true },
    orderBy: { tanggal: 'asc' },
  })
  const records30 = await prisma.presensi.findMany({
    where: { createdBy: user.id, tanggal: { gte: from30, lte: new Date() } },
    select: { tanggal: true, status: true },
    orderBy: { tanggal: 'asc' },
  })

  // Aggregate last 7 days attendance by day
  const fmt = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' })
  const days: AttendancePoint[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(last7)
    d.setDate(last7.getDate() + i)
    return { date: fmt.format(d), hadir: 0, izin: 0, sakit: 0, alpa: 0 }
  })
  for (const r of rawPresensi) {
    const idx = Math.floor((startOfDay(r.tanggal).getTime() - last7.getTime()) / (24 * 60 * 60 * 1000))
    if (idx >= 0 && idx < days.length) {
      const key = r.status.toLowerCase() as 'hadir' | 'izin' | 'sakit' | 'alpa'
      ;(days[idx] as any)[key]++
    }
  }

  const totals7 = days.reduce((acc, d) => {
    acc.hadir += d.hadir
    acc.izin += d.izin
    acc.sakit += d.sakit
    acc.alpa += d.alpa
    return acc
  }, { hadir: 0, izin: 0, sakit: 0, alpa: 0 })

  // Build 30-day dataset for report style chart
  const buckets = new Map<string, { HADIR: number; IZIN: number; SAKIT: number; ALPA: number }>()
  const cursor = new Date(from30)
  const end = new Date(now)
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0,10)
    buckets.set(key, { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0 })
    cursor.setDate(cursor.getDate()+1)
  }
  for (const r of records30) {
    const key = new Date(r.tanggal).toISOString().slice(0,10)
    const row = buckets.get(key)
    if (!row) continue
    ;(row as any)[r.status]++
  }
  const data30: AttendanceDataPoint[] = Array.from(buckets.entries()).map(([date, v]) => ({ date, ...v }))

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Hero */}
        <section className="rounded-2xl bg-gradient-to-r from-primary to-primaryDark text-white p-6 shadow">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm/5 opacity-90">Dashboard Pengajar</div>
              <h1 className="text-2xl md:text-3xl font-semibold">Assalamualaikum, {user.name ?? 'Pengajar'}</h1>
              <p className="opacity-90 text-sm">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(now)}</p>
            </div>
            <div className="flex gap-2">
              <a href="/dashboard/ustadz/presensi" className="px-4 py-2 rounded-lg bg-white text-primary font-medium hover:opacity-90">Presensi Harian</a>
              <a href="/dashboard/ustadz/santri/new" className="px-4 py-2 rounded-lg ring-1 ring-white/70 hover:bg-white/10">Tambah Santri</a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Santri" value={totalSantri} icon={Users} />
          <StatCard title="Hadir Hari Ini" value={todayHadir} icon={CheckCircle} />
          <StatCard title="Hafalan Minggu Ini" value={hafalanMingguIni} icon={BookOpen} />
          <StatCard title="Notifikasi Belum Dibaca" value={unreadNotif} icon={Bell} />
        </section>

        {/* Chart + Recent */}
        <section className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border bg-white dark:bg-base-900 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium">Grafik 30 Hari Terakhir</h2>
            </div>
            <ChartModeToggle data={data30 as any} />
          </div>
          <div className="rounded-xl border bg-white dark:bg-base-900 p-4">
            <h2 className="font-medium mb-3">Aktivitas Terbaru</h2>
            <ul className="space-y-3">
              {recentPresensi.length === 0 && (
                <li className="text-sm text-gray-500">Belum ada aktivitas.</li>
              )}
              {recentPresensi.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-primary"></span>
                  <div>
                    <div className="text-sm">
                      Presensi {p.santri?.nama ?? 'Santri'}: <span className="font-medium">{p.status}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(p.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Ringkasan 7 Hari Terakhir */}
        <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatCard title="Hadir 7 Hari" value={totals7.hadir} />
          <StatCard title="Izin 7 Hari" value={totals7.izin} />
          <StatCard title="Sakit 7 Hari" value={totals7.sakit} />
          <StatCard title="Alpa 7 Hari" value={totals7.alpa} />
        </section>

        {/* Quick actions */}
        <section className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <a href="/dashboard/ustadz/presensi" className="p-4 rounded-xl border hover:shadow bg-white dark:bg-base-900">Presensi Harian</a>
          <a href="/dashboard/ustadz/evaluasi" className="p-4 rounded-xl border hover:shadow bg-white dark:bg-base-900">Input Evaluasi</a>
          <a href="/dashboard/ustadz/santri/new" className="p-4 rounded-xl border hover:shadow bg-white dark:bg-base-900">Tambah Santri</a>
        </section>
      </main>
    </div>
  )
}
