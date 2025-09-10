"use client"
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  const isDark = theme === 'dark'
  return (
    <button
      aria-label="Toggle theme"
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex items-center justify-center h-9 w-9 rounded-full border bg-white/80 dark:bg-gray-900/80 backdrop-blur text-gray-700 dark:text-gray-200 hover:shadow-sm transition"
    >
      {isDark ? (
        // Sun icon for light mode target
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.03 2.03l1.79-1.79-1.79-1.79-1.79 1.79 1.79 1.79zM20 11v2h3v-2h-3zM6.76 19.16l-1.8 1.79 1.41 1.41 1.79-1.79-1.4-1.41zM11 20h2v3h-2v-3zm7.24-.84l1.79 1.79 1.41-1.41-1.79-1.79-1.41 1.41zM12 6a6 6 0 100 12A6 6 0 0012 6z" />
        </svg>
      ) : (
        // Moon icon for dark mode target
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M12.74 2.01a1 1 0 00-1.12 1.3A8.01 8.01 0 0020.7 14.37a1 1 0 001.3-1.12A10 10 0 0112.74 2.01zM12 22a10 10 0 01-9.95-9.06A10 10 0 0012 2v20z" />
        </svg>
      )}
    </button>
  )
}
