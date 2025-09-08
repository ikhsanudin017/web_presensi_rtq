import Nav from '@/components/nav'

export default function UstadzDashboard() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard Ustadz/Ustadzah</h1>
        <div className="flex gap-3">
          <a href="/dashboard/ustadz/presensi" className="px-4 py-2 rounded bg-primary hover:bg-primaryDark text-white">Presensi Harian</a>
          <a href="/dashboard/ustadz/santri/new" className="px-4 py-2 rounded bg-primary hover:bg-primaryDark text-white">Tambah Santri</a>
          <a href="/dashboard/admin/laporan" className="px-4 py-2 rounded border border-primary text-primary hover:bg-primary hover:text-white transition">Laporan</a>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Input presensi harian santri</li>
          <li>Catatan perkembangan hafalan</li>
          <li>Input nilai evaluasi</li>
          <li>Lihat jadwal mengajar</li>
          <li>Komunikasi dengan orang tua</li>
        </ul>
      </main>
    </div>
  )
}
