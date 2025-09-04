"use client"
import { createContext, useContext, useMemo, useState } from 'react'

type Locale = 'id' | 'ar'
type Dict = Record<string, Record<Locale, string>>

const dict: Dict = {
  hello: { id: 'Halo', ar: 'مرحبا' },
  dashboard: { id: 'Dasbor', ar: 'لوحة القيادة' },
}

const I18nContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void; t: (k: keyof typeof dict) => string } | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('id')
  const value = useMemo(() => ({
    locale,
    setLocale,
    t: (k: keyof typeof dict) => dict[k]?.[locale] ?? String(k),
  }), [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('I18nProvider missing')
  return ctx
}

