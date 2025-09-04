"use client"
import { useEffect, useMemo, useState } from 'react'
import ChartModeToggle from '@/components/charts/chart-mode-toggle'
import type { AttendanceDataPoint } from '@/components/charts/attendance-chart'

type Kelas = { id: string; nama: string }
type Santri = { id: string; nama: string; kelasId: string | null }

export default function ReportExplorer({ initialData, kelas, santri }: { initialData: AttendanceDataPoint[]; kelas: Kelas[]; santri: Santri[] }) {
  const [data, setData] = useState<AttendanceDataPoint[]>(initialData)
  const [from, setFrom] = useState<string>(() => defaultFrom())
  const [to, setTo] = useState<string>(() => today())
  const [kelasId, setKelasId] = useState<string>('')
  const [santriId, setSantriId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const santriOptions = useMemo(() => santri.filter(s => !kelasId || s.kelasId === kelasId), [santri, kelasId])

  useEffect(() => { setSantriId('') }, [kelasId])

  const apply = async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (kelasId) params.set('kelasId', kelasId)
    if (santriId) params.set('santriId', santriId)
    const res = await fetch(`/api/reports/presensi?${params.toString()}`)
    setLoading(false)
    if (!res.ok) { setError((await res.json()).error || 'Gagal memuat'); return }
    const json = await res.json()
    setData(json.data as AttendanceDataPoint[])
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-sm mb-1">Dari</label>
          <input type="date" className="w-full border rounded px-3 py-2 bg-transparent" value={from} onChange={e=>setFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Sampai</label>
          <input type="date" className="w-full border rounded px-3 py-2 bg-transparent" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Kelas</label>
          <select className="w-full border rounded px-3 py-2 bg-transparent" value={kelasId} onChange={e=>setKelasId(e.target.value)}>
            <option value="">Semua</option>
            {kelas.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Santri</label>
          <select className="w-full border rounded px-3 py-2 bg-transparent" value={santriId} onChange={e=>setSantriId(e.target.value)}>
            <option value="">Semua</option>
            {santriOptions.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={apply} className="flex-1 px-3 py-2 rounded bg-blue-600 text-white">{loading ? 'Memuat…' : 'Terapkan'}</button>
          <a className="px-3 py-2 rounded border" href={`/api/export/presensi/pdf?${new URLSearchParams({ ...(from?{from}:{}), ...(to?{to}:{}), ...(kelasId?{kelasId}:{}), ...(santriId?{santriId}:{}), }).toString()}`}>Export PDF</a>
        </div>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <ChartModeToggle data={data} />
    </div>
  )
}

function today() {
  const d = new Date();
  const s = new Date(d.getTime() - d.getTimezoneOffset()*60000)
  return s.toISOString().slice(0,10)
}
function defaultFrom() {
  const d = new Date(); d.setDate(d.getDate()-30)
  const s = new Date(d.getTime() - d.getTimezoneOffset()*60000)
  return s.toISOString().slice(0,10)
}
