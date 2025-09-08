"use client"
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginUstadzPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', { redirect: false, identifier, password, role: 'USTADZ' })
    setLoading(false)
    if (res?.ok) router.push('/dashboard')
    else setError('Username/Email atau password salah')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded p-6 bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-semibold">Masuk Ustadz</h1>
        <div>
          <label className="block text-sm mb-1">Username atau Email</label>
          <input className="w-full border rounded px-3 py-2 bg-transparent" type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input className="w-full border rounded px-3 py-2 bg-transparent" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full bg-primary hover:bg-primaryDark text-white rounded py-2 transition-colors">
          {loading ? 'Memproses…' : 'Masuk'}
        </button>
        <p className="text-xs mt-2 text-center opacity-70"><a className="hover:underline" href="/login">Pilih jenis login lain</a></p>
      </form>
    </main>
  )
}

