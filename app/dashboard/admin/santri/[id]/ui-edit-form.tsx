"use client"
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Santri = {
  id: string
  nama: string
  nis: string
  tanggalLahir: string | null
  alamat: string | null
}

export default function EditForm({ santri }: { santri: Santri }) {
  const router = useRouter()
  const [form, setForm] = useState({
    nama: santri.nama,
    nis: santri.nis,
    tanggalLahir: santri.tanggalLahir ? santri.tanggalLahir.slice(0, 10) : '',
    alamat: santri.alamat || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/santri/${santri.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setLoading(false)
    if (res.ok) router.push('/dashboard/admin/santri')
    else setError((await res.json()).error || 'Gagal menyimpan')
  }

  const del = async () => {
    if (!confirm('Hapus santri ini?')) return
    setLoading(true)
    const res = await fetch(`/api/santri/${santri.id}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) router.push('/dashboard/admin/santri')
    else setError((await res.json()).error || 'Gagal menghapus')
  }

  return (
    <form onSubmit={save} className="space-y-4 border rounded p-4">
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
        <button disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? 'Menyimpan…' : 'Simpan'}</button>
        <button type="button" disabled={loading} className="px-4 py-2 rounded border" onClick={()=>history.back()}>Batal</button>
        <button type="button" disabled={loading} onClick={del} className="ml-auto px-4 py-2 rounded bg-red-600 text-white">Hapus</button>
      </div>
    </form>
  )
}

