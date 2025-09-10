import Link from 'next/link'
import Image from 'next/image'
import { GraduationCap, Users, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center gap-8 p-6 overflow-hidden hero-clean">
      {/* Background: clean dotted grid */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.10] dot-grid" />
      </div>

      {/* Logo with glow */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 blur-2xl rounded-full bg-primary/30 scale-125" />
        <Image src="/rtq-logo.png" alt="Logo RTQ" width={120} height={120} priority className="drop-shadow-xl select-none" />
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold text-center tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Presensi Rumah Tahfizh Quran</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
        Sistem presensi harian, monitoring hafalan, evaluasi, dan komunikasi antara admin, pengajar, serta orang tua.
      </p>

      {/* Role cards */}
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link href="/dashboard/ustadz" className="group relative rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/75 dark:bg-base-900/50 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-semibold">Untuk Pengajar</div>
                <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">Akses presensi kelas, penilaian, dan evaluasi santri.</p>
              </div>
              <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition text-primary mt-1" />
            </div>
          </Link>
          <Link href="/dashboard/orangtua" className="group relative rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/75 dark:bg-base-900/50 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shadow-sm">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-semibold">Untuk Orang Tua</div>
                <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">Pantau kehadiran, hafalan, dan perkembangan anak.</p>
              </div>
              <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition text-primary mt-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* footer tiny */}
      <div className="text-xs text-gray-500 mt-4">© {new Date().getFullYear()} RTQ</div>
    </main>
  )
}
