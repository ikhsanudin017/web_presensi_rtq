"use client"
import { signIn } from 'next-auth/react'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginUstadzForm() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const sp = useSearchParams()

  const presets = [
    { label: 'Ustadz Yuliyanto', value: 'yuliyanto@rtq.local' },
    { label: 'Mbak Zulfaa', value: 'zulfaa@rtq.local' },
    { label: 'Mas Nofhendri', value: 'nofhendri@rtq.local' },
  ]

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    // Build target URL first to let NextAuth craft proper callback
    const cb = sp.get('callbackUrl') || ''
    let to = '/dashboard'
    if (cb) {
      try { to = new URL(cb).pathname || to } catch { to = cb.startsWith('/') ? cb : to }
    }
    const res = await signIn('credentials', {
      redirect: false,
      callbackUrl: to,
      identifier,
      password,
      role: 'USTADZ'
    })
    setLoading(false)
    if (res?.ok) {
      // Perform a full navigation to guarantee fresh session everywhere
      const url = res.url || to
      if (typeof window !== 'undefined') window.location.href = url
    }
    else setError('Username/Email atau password salah')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded p-6 bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-semibold">Masuk Pengajar</h1>
        <div>
          <label className="block text-sm mb-1">Pengajar</label>
          <select
            className="w-full border rounded px-3 py-2 bg-transparent"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          >
            <option value="" disabled>Pilih pengajar</option>
            {presets.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {null}
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input className="w-full border rounded px-3 py-2 bg-transparent" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full bg-primary hover:bg-primaryDark text-white rounded py-2 transition-colors">
          {loading ? 'Memproses…' : 'Masuk'}
        </button>
        <p className="text-xs mt-2 text-center opacity-70"><a className="hover:underline" href="/login/orangtua">Masuk sebagai Orang Tua</a></p>
      </form>
    </main>
  )
}

export default function LoginUstadzPage() {
  return <Suspense><LoginUstadzForm /></Suspense>
}
