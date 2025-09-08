"use client"
import Nav from '@/components/nav'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewSantriPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nama: '', nis: '', tanggalLahir: '', alamat: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/santri', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setLoading(false)
    if (res.ok) router.push('/dashboard/admin/santri')
    else setError((await res.json()).error || 'Gagal menyimpan')
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Tambah Santri</h1>
        <form onSubmit={submit} className="space-y-4 border rounded p-4">
          <div>
            <label className="block text-sm">Nama</label>
            <input className="w-full border rounded px-3 py-2 bg-transparent" value={form.nama} onChange={e=>setForm(f=>({...f, nama:e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm">NIS</label>
            <input className="w-full border rounded px-3 py-2 bg-transparent" value={form.nis} onChange={e=>setForm(f=>({...f, nis:e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm">Tanggal Lahir</label>
            <input type="date" className="w-full border rounded px-3 py-2 bg-transparent" value={form.tanggalLahir} onChange={e=>setForm(f=>({...f, tanggalLahir:e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm">Alamat</label>
            <input className="w-full border rounded px-3 py-2 bg-transparent" value={form.alamat} onChange={e=>setForm(f=>({...f, alamat:e.target.value}))} />
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

