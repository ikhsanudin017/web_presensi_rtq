"use client"
import Nav from '@/components/nav'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewUstadzPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, role: 'USTADZ' }) })
    setLoading(false)
    if (res.ok) router.push('/dashboard/admin/ustadz')
    else setError((await res.json()).error || 'Gagal menyimpan')
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Tambah Ustadz/Ustadzah</h1>
        <form onSubmit={submit} className="space-y-4 border rounded p-4">
          <div>
            <label className="block text-sm">Nama</label>
            <input className="w-full border rounded px-3 py-2 bg-transparent" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm">Username</label>
            <input className="w-full border rounded px-3 py-2 bg-transparent" value={form.username} onChange={e=>setForm(f=>({...f, username:e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2 bg-transparent" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm">Password</label>
            <input type="password" className="w-full border rounded px-3 py-2 bg-transparent" value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm">Telepon</label>
            <input className="w-full border rounded px-3 py-2 bg-transparent" value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button disabled={loading} className="px-4 py-2 rounded bg-primary hover:bg-primaryDark text-white transition-colors">{loading ? 'Menyimpan…' : 'Simpan'}</button>
            <button type="button" className="px-4 py-2 rounded border" onClick={()=>router.back()}>Batal</button>
          </div>
        </form>
      </main>
    </div>
  )
}
