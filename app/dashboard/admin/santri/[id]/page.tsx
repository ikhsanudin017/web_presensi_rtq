import Nav from '@/components/nav'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EditForm from './ui-edit-form'

export default async function EditSantriPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/')
  const santri = await prisma.santri.findUnique({ where: { id: params.id } })
  if (!santri) redirect('/dashboard/admin/santri')
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Edit Santri</h1>
        <EditForm santri={santri} />
      </main>
    </div>
  )
}

