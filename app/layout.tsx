import './globals.css'
import type { Metadata } from 'next'
import { Inter, El_Messiri, Cairo } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import Providers from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })
const elMessiri = El_Messiri({ subsets: ['latin', 'arabic'], weight: ['400','500','600','700'], variable: '--font-el-messiri' })
const cairo = Cairo({ subsets: ['latin', 'arabic'], weight: ['300','400','500','600','700'], variable: '--font-cairo' })

export const metadata: Metadata = {
  title: "Presensi RTQ Ibnu Mas'ud",
  description: 'Website Presensi Rumah Tahfizh Quran Ibnu Mas\'ud dengan Monitoring Orang Tua',
  icons: {
    icon: '/rtq-logo.png',
    shortcut: '/rtq-logo.png',
    apple: '/rtq-logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${cairo.className} ${elMessiri.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
