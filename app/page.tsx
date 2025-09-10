import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center gap-8 p-6 overflow-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Logo */}
      <Image
        src="/rtq-logo.png"
        alt="Logo RTQ"
        width={120}
        height={120}
        priority
        className="drop-shadow-lg select-none"
      />

      <h1 className="text-4xl md:text-6xl font-extrabold text-center tracking-tight">Presensi Rumah Tahfizh Quran</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl">
        Sistem presensi harian, monitoring hafalan, evaluasi, dan komunikasi antara admin, pengajar, serta orang tua.
      </p>

      <div className="flex gap-3">
        <Link className="px-5 py-2.5 rounded-md bg-primary hover:bg-primaryDark text-white shadow-sm ring-1 ring-primary/30 transition-colors" href="/login/ustadz">Masuk</Link>
        <Link className="px-5 py-2.5 rounded-md border border-primary text-primary hover:bg-primary hover:text-white shadow-sm transition-colors" href="/dashboard">Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mt-2">
        <Link href="/dashboard/ustadz" className="block rounded-lg border p-6 hover:border-primary hover:bg-primaryMuted transition shadow-sm">
          <h2 className="text-xl font-semibold mb-1">Untuk Pengajar</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Akses presensi kelas, penilaian, dan evaluasi santri.</p>
        </Link>
        <Link href="/dashboard/orangtua" className="block rounded-lg border p-6 hover:border-primary hover:bg-primaryMuted transition shadow-sm">
          <h2 className="text-xl font-semibold mb-1">Untuk Orang Tua</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Pantau kehadiran, hafalan, dan perkembangan anak.</p>
        </Link>
      </div>
    </main>
  )
}
