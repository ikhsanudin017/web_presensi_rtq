import Nav from '@/components/nav'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SantriListPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/')
  const santri = await prisma.santri.findMany({
    orderBy: { nama: 'asc' },
    include: { parent: { select: { name: true } }, kelas: { select: { nama: true } } }
  })
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Data Santri</h1>
          <Link href="/dashboard/admin/santri/new" className="px-3 py-2 rounded bg-blue-600 text-white">Tambah Santri</Link>
        </div>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-3 py-2">Nama</th>
                <th className="text-left px-3 py-2">NIS</th>
                <th className="text-left px-3 py-2">Orang Tua</th>
                <th className="text-left px-3 py-2">Kelas</th>
                <th className="text-left px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {santri.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2">{s.nama}</td>
                  <td className="px-3 py-2">{s.nis}</td>
                  <td className="px-3 py-2">{s.parent?.name ?? '-'}</td>
                  <td className="px-3 py-2">{s.kelas?.nama ?? '-'}</td>
                  <td className="px-3 py-2">
                    <Link href={`/dashboard/admin/santri/${s.id}`} className="text-blue-600">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

