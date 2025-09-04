"use client"
import Nav from '@/components/nav'
import { useEffect, useMemo, useState } from 'react'

type Santri = { id: string; nama: string; kelasId: string | null }
type Presensi = { id: string; santriId: string; tanggal: string; status: 'HADIR'|'IZIN'|'SAKIT'|'ALPA'; catatan?: string|null }

export default function PresensiPage() {
  const [santri, setSantri] = useState<Santri[]>([])
  const [kelasId, setKelasId] = useState<string>('')
  const [santriId, setSantriId] = useState<string>('')
  const [status, setStatus] = useState<'HADIR'|'IZIN'|'SAKIT'|'ALPA'>('HADIR')
  const [catatan, setCatatan] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recent, setRecent] = useState<Presensi[]>([])

  useEffect(() => { loadSantri(); loadRecent() }, [])

  const kelasOptions = useMemo(() => {
    const ids = new Set(santri.map(s => s.kelasId).filter(Boolean) as string[])
    return Array.from(ids)
  }, [santri])

  const santriOptions = useMemo(() => santri.filter(s => !kelasId || s.kelasId === kelasId), [santri, kelasId])

  useEffect(() => { setSantriId('') }, [kelasId])

  async function loadSantri() {
    setError(null)
    const res = await fetch('/api/santri')
    if (!res.ok) { setError((await res.json()).error || 'Gagal memuat santri'); return }
    const json = await res.json()
    setSantri(json.santri as Santri[])
  }

  async function loadRecent() {
    setError(null)
    const res = await fetch('/api/presensi')
    if (!res.ok) { setError((await res.json()).error || 'Gagal memuat data'); return }
    const json = await res.json()
    setRecent((json.data as Presensi[]).slice(0, 20))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!santriId) { setError('Pilih santri terlebih dahulu'); return }
    setSubmitting(true)
    setError(null)
    const res = await fetch('/api/presensi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ santriId, status, catatan: catatan || undefined })
    })
    setSubmitting(false)
    if (!res.ok) { setError((await res.json()).error || 'Gagal menyimpan'); return }
    setCatatan('')
    // keep current filter selections
    await loadRecent()
  }

  const nameById = useMemo(() => Object.fromEntries(santri.map(s => [s.id, s.nama] as const)), [santri])

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Presensi Harian</h1>
        </header>

        <section className="space-y-3 border rounded p-4">
          <h2 className="font-medium">Input Presensi</h2>
          <form onSubmit={submit} className="grid md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-sm mb-1">Kelas</label>
              <select className="w-full border rounded px-3 py-2 bg-transparent" value={kelasId} onChange={e=>setKelasId(e.target.value)}>
                <option value="">Semua</option>
                {kelasOptions.map(id => <option key={id} value={id}>Kelas {id.slice(0,6)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Santri</label>
              <select className="w-full border rounded px-3 py-2 bg-transparent" value={santriId} onChange={e=>setSantriId(e.target.value)} required>
                <option value="">Pilih santri</option>
                {santriOptions.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Status</label>
              <select className="w-full border rounded px-3 py-2 bg-transparent" value={status} onChange={e=>setStatus(e.target.value as any)}>
                <option value="HADIR">Hadir</option>
                <option value="IZIN">Izin</option>
                <option value="SAKIT">Sakit</option>
                <option value="ALPA">Alpa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Catatan (opsional)</label>
              <input className="w-full border rounded px-3 py-2 bg-transparent" value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Misal: Sakit, izin..." />
            </div>
            <div className="md:col-span-4">
              <button disabled={submitting} className="px-4 py-2 rounded bg-primary hover:bg-primaryDark text-white disabled:opacity-50">
                {submitting ? 'Menyimpan...' : 'Simpan Presensi'}
              </button>
              {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
            </div>
          </form>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium">Riwayat Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left p-2 border">Tanggal</th>
                  <th className="text-left p-2 border">Santri</th>
                  <th className="text-left p-2 border">Status</th>
                  <th className="text-left p-2 border">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2 border">{new Date(r.tanggal).toLocaleString()}</td>
                    <td className="p-2 border">{nameById[r.santriId] || r.santriId}</td>
                    <td className="p-2 border">
                      <span className={badgeColor(r.status)}>{r.status}</span>
                    </td>
                    <td className="p-2 border">{r.catatan ?? '-'}</td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td className="p-3 text-center opacity-70" colSpan={4}>Belum ada data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

function badgeColor(status: Presensi['status']) {
  const base = 'px-2 py-0.5 rounded text-xs'
  switch (status) {
    case 'HADIR': return base + ' bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    case 'IZIN': return base + ' bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'SAKIT': return base + ' bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    case 'ALPA': return base + ' bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }
}
