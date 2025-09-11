import Nav from '@/components/nav'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StatCard from '@/components/StatCard'
import { CheckCircle, BookOpen, CalendarCheck, Heart } from 'lucide-react'

export default async function OrangTuaDashboard() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user) redirect('/login')
  if (user.role !== 'ORANG_TUA') redirect('/dashboard')

  const children = await prisma.santri.findMany({ where: { parentId: user.id }, orderBy: { nama: 'asc' }, include: { kelas: { select: { nama: true } } } })
  const childIds = children.map(c => c.id)

  const now = new Date()
  const from30 = new Date(now)
  from30.setDate(now.getDate() - 30)
  from30.setHours(0,0,0,0)

  // Jalankan berurutan untuk menghemat koneksi DB
  let recentPresensi: any[] = []
  let recentEvaluasi: any[] = []
  let presensi30: any[] = []
  let evaluasiAvg: any = { _avg: { nilai: null } }
  if (childIds.length) {
    recentPresensi = await prisma.presensi.findMany({ where: { santriId: { in: childIds } }, orderBy: { tanggal: 'desc' }, take: 10, include: { santri: { select: { nama: true } } } })
    recentEvaluasi = await prisma.evaluasi.findMany({ where: { santriId: { in: childIds } }, orderBy: { tanggal: 'desc' }, take: 10, include: { santri: { select: { nama: true } } } })
    presensi30 = await prisma.presensi.findMany({ where: { santriId: { in: childIds }, tanggal: { gte: from30 } }, orderBy: { tanggal: 'asc' } })
    evaluasiAvg = await prisma.evaluasi.aggregate({ _avg: { nilai: true }, where: { santriId: { in: childIds }, tanggal: { gte: from30 } } }) as any
  }

  const hadir = presensi30.filter(p => p.status === 'HADIR').length
  const total = presensi30.length || 1
  const rate = Math.round((hadir / total) * 100)
  const avgNilai = Math.round((evaluasiAvg._avg.nilai ?? 0))

  function motivation(attPct: number, avg: number) {
    if (attPct >= 85 || avg >= 85) {
      return {
        tone: 'good',
        title: 'Barakallahu fiikum! 🌟',
        text: 'Ananda menunjukkan kedisiplinan dan semangat belajar yang baik. Semoga Allah meneguhkan hati untuk terus istiqamah dalam menghafal dan muroja’ah Al‑Qur’an.',
      }
    }
    if (attPct >= 65 || avg >= 70) {
      return {
        tone: 'ok',
        title: 'Terus semangat, insyaAllah bisa! 💪',
        text: '“Amalan yang paling dicintai Allah adalah yang kontinu walaupun sedikit.” (HR. Bukhari). Mari jaga rutinitas hadir dan muroja’ah harian.',
      }
    }
    return {
      tone: 'needs',
      title: 'Bismillah, yuk bangun kebiasaan baik 🌱',
      text: '“Sesungguhnya bersama kesulitan ada kemudahan.” (QS. Al‑Insyirah 5–6). Ajak ananda menata jadwal harian yang ringan namun konsisten.',
    }
  }

  const msg = motivation(rate, avgNilai)

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Hero Motivation */}
        <section className={
          'rounded-2xl p-6 shadow bg-gradient-to-r ' +
          (msg.tone === 'good' ? 'from-primary to-primaryDark text-white' : msg.tone === 'ok' ? 'from-amber-400 to-yellow-500 text-white' : 'from-rose-400 to-pink-500 text-white')
        }>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">Dashboard Orang Tua</h1>
              <p className="max-w-2xl opacity-95">{msg.title} {msg.text}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[220px]">
              <div className="text-center rounded-lg bg-white/15 px-3 py-2">
                <div className="text-xs opacity-90">Kehadiran 30 Hari</div>
                <div className="text-xl font-semibold">{rate}%</div>
              </div>
              <div className="text-center rounded-lg bg-white/15 px-3 py-2">
                <div className="text-xs opacity-90">Rata-rata Nilai</div>
                <div className="text-xl font-semibold">{avgNilai}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Anak table */}
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Anak Anda</h2>
          {children.length === 0 ? (
            <p className="text-sm opacity-80">Belum ada data santri terkait akun ini.</p>
          ) : (
            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-3 py-2">Nama</th>
                    <th className="text-left px-3 py-2">NIS</th>
                    <th className="text-left px-3 py-2">Kelas</th>
                  </tr>
                </thead>
                <tbody>
                  {children.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-2">{s.nama}</td>
                      <td className="px-3 py-2">{s.nis}</td>
                      <td className="px-3 py-2">{(s as any).kelas?.nama ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Stats mini cards */}
        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Hadir (30 hari)" value={`${hadir}/${total}`} subtitle={`${rate}%`} icon={CheckCircle} />
          <StatCard title="Rata-rata Nilai" value={avgNilai} subtitle="Skala 0–100" icon={BookOpen} />
          <StatCard title="Catatan Presensi" value={presensi30.length} subtitle="30 hari terakhir" icon={CalendarCheck} />
          <StatCard title="Dukungan Orang Tua" value={msg.tone === 'good' ? 'Istiqamah' : msg.tone === 'ok' ? 'Perkuat Rutinitas' : 'Bangun Kebiasaan'} icon={Heart} />
        </section>

        {/* Recent tables */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h2 className="text-xl font-medium">Presensi Terbaru</h2>
            {recentPresensi.length === 0 ? (
              <p className="text-sm opacity-80">Belum ada data presensi.</p>
            ) : (
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-3 py-2">Tanggal</th>
                      <th className="text-left px-3 py-2">Santri</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-left px-3 py-2">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPresensi.map((p: any) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-3 py-2">{new Date(p.tanggal).toLocaleDateString('id-ID')}</td>
                        <td className="px-3 py-2">{p.santri?.nama ?? '-'}</td>
                        <td className="px-3 py-2">{p.status}</td>
                        <td className="px-3 py-2">{p.catatan ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-medium">Evaluasi Terbaru</h2>
            {recentEvaluasi.length === 0 ? (
              <p className="text-sm opacity-80">Belum ada data evaluasi.</p>
            ) : (
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-3 py-2">Tanggal</th>
                      <th className="text-left px-3 py-2">Santri</th>
                      <th className="text-left px-3 py-2">Nilai</th>
                      <th className="text-left px-3 py-2">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvaluasi.map((e: any) => (
                      <tr key={e.id} className="border-t">
                        <td className="px-3 py-2">{new Date(e.tanggal).toLocaleDateString('id-ID')}</td>
                        <td className="px-3 py-2">{e.santri?.nama ?? '-'}</td>
                        <td className="px-3 py-2">{e.nilai}</td>
                        <td className="px-3 py-2">{e.catatan ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
