import Nav from '@/components/nav'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function OrangTuaDashboard() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user) redirect('/login')
  if (user.role !== 'ORANG_TUA') redirect('/dashboard')

  const children = await prisma.santri.findMany({ where: { parentId: user.id }, orderBy: { nama: 'asc' } })
  const childIds = children.map(c => c.id)

  const [presensi, evaluasi] = await Promise.all([
    childIds.length ? prisma.presensi.findMany({ where: { santriId: { in: childIds } }, orderBy: { tanggal: 'desc' }, take: 10 }) : Promise.resolve([]),
    childIds.length ? prisma.evaluasi.findMany({ where: { santriId: { in: childIds } }, orderBy: { tanggal: 'desc' }, take: 10 }) : Promise.resolve([]),
  ])

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard Orang Tua</h1>

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
                      <td className="px-3 py-2">{(s as any).kelasId ? (s as any).kelasId : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h2 className="text-xl font-medium">Presensi Terbaru</h2>
            {presensi.length === 0 ? (
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
                    {presensi.map((p: any) => {
                      const s = children.find(c => c.id === p.santriId)
                      return (
                        <tr key={p.id} className="border-t">
                          <td className="px-3 py-2">{new Date(p.tanggal).toLocaleDateString()}</td>
                          <td className="px-3 py-2">{s?.nama ?? '-'}</td>
                          <td className="px-3 py-2">{p.status}</td>
                          <td className="px-3 py-2">{p.catatan ?? '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-medium">Evaluasi Terbaru</h2>
            {evaluasi.length === 0 ? (
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
                    {evaluasi.map((e: any) => {
                      const s = children.find(c => c.id === e.santriId)
                      return (
                        <tr key={e.id} className="border-t">
                          <td className="px-3 py-2">{new Date(e.tanggal).toLocaleDateString()}</td>
                          <td className="px-3 py-2">{s?.nama ?? '-'}</td>
                          <td className="px-3 py-2">{e.nilai}</td>
                          <td className="px-3 py-2">{e.catatan ?? '-'}</td>
                        </tr>
                      )
                    })}
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
