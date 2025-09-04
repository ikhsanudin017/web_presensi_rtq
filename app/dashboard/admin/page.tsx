import Nav from '@/components/nav'
import Link from 'next/link'

export default async function AdminDashboard() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Santri" href="/dashboard/admin/santri" desc="Kelola data santri" />
          <Card title="Ustadz/Ustadzah" href="/dashboard/admin/ustadz" desc="Kelola data ustadz" />
          <Card title="Orang Tua" href="/dashboard/admin/orang-tua" desc="Kelola data orang tua" />
          <Card title="Laporan Presensi" href="/dashboard/admin/laporan" desc="Lihat statistik dan unduh laporan" />
          <Card title="Pengaturan" href="/dashboard/admin/pengaturan" desc="Pengaturan sistem" />
        </div>
      </main>
    </div>
  )
}

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="border rounded p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="font-medium">{title}</div>
      <div className="text-sm opacity-75">{desc}</div>
    </Link>
  )
}

