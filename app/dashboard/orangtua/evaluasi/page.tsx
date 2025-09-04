import Nav from '@/components/nav'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function OrangTuaEvaluasiPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ORANG_TUA') redirect('/')
  const userId = (session.user as any).id
  const children = await prisma.santri.findMany({ where: { parentId: userId }, orderBy: { nama: 'asc' } })
  const evals = await prisma.evaluasi.findMany({ where: { santriId: { in: children.map(c => c.id) } }, orderBy: { tanggal: 'desc' }, take: 50 })
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Evaluasi Anak</h1>
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
              {evals.map(ev => {
                const s = children.find(c => c.id === ev.santriId)
                return (
                  <tr key={ev.id} className="border-t">
                    <td className="px-3 py-2">{new Date(ev.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="px-3 py-2">{s?.nama ?? '-'}</td>
                    <td className="px-3 py-2">{ev.nilai}</td>
                    <td className="px-3 py-2">{ev.catatan ?? '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

