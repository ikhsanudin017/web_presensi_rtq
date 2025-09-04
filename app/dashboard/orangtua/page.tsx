import Nav from '@/components/nav'

export default function OrangTuaDashboard() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard Orang Tua</h1>
        <ul className="list-disc pl-5 space-y-1">
          <li>Lihat presensi anak</li>
          <li>Monitor perkembangan hafalan</li>
          <li>Lihat nilai evaluasi</li>
          <li>Riwayat kehadiran (grafik)</li>
          <li>Notifikasi ketidakhadiran</li>
          <li>Komunikasi dengan ustadz</li>
        </ul>
      </main>
    </div>
  )
}

