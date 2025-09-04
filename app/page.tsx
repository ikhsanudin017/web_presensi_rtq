import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl md:text-5xl font-bold text-center">Presensi Rumah Tahfidz Quran</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 max-w-xl">
        Sistem presensi harian, monitoring hafalan, evaluasi, dan komunikasi antara admin, ustadz/ustadzah, serta orang tua.
      </p>
      <div className="flex gap-3">
        <Link className="px-4 py-2 rounded bg-primary hover:bg-primaryDark text-white" href="/login">Masuk</Link>
        <Link className="px-4 py-2 rounded border border-primary text-primary hover:bg-primary hover:text-white transition" href="/dashboard/admin">Dashboard</Link>
      </div>
    </main>
  )
}
