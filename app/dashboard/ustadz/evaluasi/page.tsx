import Nav from '@/components/nav'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EvaluasiForm from './ui-form'

export default async function UstadzEvaluasiPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'USTADZ') redirect('/')
  const userId = (session.user as any).id
  const santri = await prisma.santri.findMany({ where: { kelas: { ustadzId: userId } }, orderBy: { nama: 'asc' } })
  const evaluasi = await prisma.evaluasi.findMany({ where: { santriId: { in: santri.map(s => s.id) } }, orderBy: { tanggal: 'desc' }, take: 20 })
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Input Evaluasi</h1>
        <EvaluasiForm santri={santri.map(s => ({ id: s.id, nama: s.nama }))} />
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Riwayat Terbaru</h2>
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
                {evaluasi.map(ev => (
                  <tr key={ev.id} className="border-t">
                    <td className="px-3 py-2">{new Date(ev.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="px-3 py-2">{santri.find(s=>s.id===ev.santriId)?.nama ?? '-'}</td>
                    <td className="px-3 py-2">{ev.nilai}</td>
                    <td className="px-3 py-2">{ev.catatan ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

