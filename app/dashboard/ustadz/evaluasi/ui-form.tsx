"use client"
import { useState } from 'react'

export default function EvaluasiForm({ santri }: { santri: { id: string; nama: string }[] }) {
  const [santriId, setSantriId] = useState(santri[0]?.id || '')
  const [nilai, setNilai] = useState<number | ''>('')
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOk(false)
    setError(null)
    if (!santriId || nilai === '') { setError('Lengkapi data'); return }
    setLoading(true)
    const res = await fetch('/api/evaluasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ santriId, nilai: Number(nilai), catatan })
    })
    setLoading(false)
    if (res.ok) { setOk(true); setCatatan(''); setNilai('') }
    else setError((await res.json()).error || 'Gagal menyimpan')
  }

  return (
    <form onSubmit={submit} className="space-y-4 border rounded p-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Santri</label>
          <select className="w-full border rounded px-3 py-2 bg-transparent" value={santriId} onChange={e=>setSantriId(e.target.value)}>
            {santri.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Nilai</label>
          <input type="number" min={0} max={100} className="w-full border rounded px-3 py-2 bg-transparent" value={nilai} onChange={e=>setNilai(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0-100" />
        </div>
        <div>
          <label className="block text-sm mb-1">Catatan</label>
          <input className="w-full border rounded px-3 py-2 bg-transparent" value={catatan} onChange={e=>setCatatan(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {ok && <p className="text-green-600 text-sm">Tersimpan.</p>}
      <button disabled={loading} className="px-4 py-2 rounded bg-primary hover:bg-primaryDark text-white transition-colors">{loading ? 'Menyimpan…' : 'Simpan'}</button>
    </form>
  )
}

