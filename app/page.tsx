import Link from 'next/link'
import Image from 'next/image'
import { GraduationCap, Users, ArrowRight, Sparkles } from 'lucide-react'
import ThemeToggle from '@/components/theme-toggle'

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center gap-8 p-6 overflow-hidden hero-clean soft-hero">
      {/* Theme toggle (top-right) */}
      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <ThemeToggle />
      </div>
      {/* Background layers (subtle) */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] dot-grid" />
      </div>

      {/* Logo minimal */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 blur-2xl rounded-full bg-primary/20 scale-125" />
        <Image src="/rtq-logo.png" alt="Logo RTQ" width={120} height={120} priority className="drop-shadow-xl select-none" />
      </div>

      <h1 className="heading-arabic text-4xl md:text-6xl font-extrabold text-center tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
        Presensi Rumah Tahfizh Quran Ibnu Mas'ud
      </h1>

      {/* Clean Islamic divider */}
      <IslamicDivider />

      <p className="text-center text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
        Sistem presensi harian, monitoring hafalan, evaluasi, dan komunikasi antara admin, pengajar, serta orang tua.
      </p>

      {/* Role cards */}
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link href="/dashboard/ustadz" className="group relative rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/80 dark:bg-base-900/60 backdrop-blur p-6 shadow-sm hover:shadow-lg transition card-3d">
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
          <Link href="/dashboard/orangtua" className="group relative rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/80 dark:bg-base-900/60 backdrop-blur p-6 shadow-sm hover:shadow-lg transition card-3d">
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
      <div className="text-xs text-gray-500 mt-4 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5"/> © {new Date().getFullYear()} RTQ</div>
    </main>
  )
}

function IslamicDivider() {
  return (
    <svg width="540" height="20" viewBox="0 0 540 20" fill="none" aria-hidden className="opacity-80">
      <defs>
        <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a5b4fc"/>
          <stop offset="100%" stopColor="#67e8f9"/>
        </linearGradient>
      </defs>
      <line x1="0" y1="10" x2="230" y2="10" stroke="url(#line)" strokeWidth="1"/>
      <polygon points="270,10 260,2 250,10 260,18" fill="url(#line)"/>
      <polygon points="290,10 280,2 270,10 280,18" fill="url(#line)"/>
      <line x1="310" y1="10" x2="540" y2="10" stroke="url(#line)" strokeWidth="1"/>
    </svg>
  )
}
