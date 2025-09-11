import Nav from '@/components/nav'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EvaluasiForm from './ui-form'
import EvaluasiRecent from './recent-client'

export default async function UstadzEvaluasiPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'USTADZ') redirect('/')
  // Global list of santri for input options
  const santri = await prisma.santri.findMany({ orderBy: { nama: 'asc' } })
  // Show recent evaluations globally (not limited by pengajar)
  const evaluasi = await prisma.evaluasi.findMany({
    orderBy: { tanggal: 'desc' },
    take: 20,
    include: {
      santri: { select: { nama: true } },
      ustadz: { select: { name: true } },
    },
  })
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Input Evaluasi</h1>
        <EvaluasiForm santri={santri.map(s => ({ id: s.id, nama: s.nama }))} />
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Riwayat Terbaru</h2>
          <div className="overflow-x-auto border rounded">
            <EvaluasiRecent items={evaluasi.map(ev => ({
              id: ev.id,
              tanggal: ev.tanggal,
              nilai: ev.nilai,
              catatan: ev.catatan || '',
              santriNama: (ev as any).santri?.nama || santri.find(s=>s.id===ev.santriId)?.nama || '-',
              pengujiNama: (ev as any).ustadz?.name || '-',
            }))} />
          </div>
        </section>
      </main>
    </div>
  )
}
