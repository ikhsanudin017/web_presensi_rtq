"use client"
import { useMemo, useState } from 'react'

type Item = { id: string; tanggal: string | Date; nilai: number; catatan: string; santriNama: string; pengujiNama: string }

export default function EvaluasiRecent({ items: initial }: { items: Item[] }) {
  const [items, setItems] = useState<Item[]>(() => initial)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const labelFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })
    const keyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const map = new Map<string, { label: string; items: Item[] }>()
    for (const it of items) {
      const d = new Date(it.tanggal)
      const key = keyOf(d)
      const label = labelFmt.format(d)
      if (!map.has(key)) map.set(key, { label, items: [] })
      map.get(key)!.items.push(it)
    }
    return Array.from(map.entries()).map(([key, v]) => ({ key, label: v.label, items: v.items }))
  }, [items])

  async function onDelete(id: string) {
    if (!confirm('Hapus evaluasi ini?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/evaluasi/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal menghapus')
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="text-left px-3 py-2">Tanggal</th>
          <th className="text-left px-3 py-2">Santri</th>
          <th className="text-left px-3 py-2">Nilai</th>
          <th className="text-left px-3 py-2">Catatan</th>
          <th className="text-left px-3 py-2 w-[140px]">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {grouped.map(g => (
          <>
            <tr key={`h-${g.key}`} className="border-t bg-gray-50 dark:bg-gray-800/50">
              <td className="px-3 py-2 font-medium" colSpan={5}>{g.label}</td>
            </tr>
            {g.items.map(ev => {
          const d = new Date(ev.tanggal)
          const detailOpen = openId === ev.id
          return (
            <>
              <tr key={ev.id} className="border-t">
                <td className="px-3 py-2">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(d)}</td>
                <td className="px-3 py-2">{ev.santriNama}</td>
                <td className="px-3 py-2">{ev.nilai}</td>
                <td className="px-3 py-2">{ev.catatan || '-'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded border text-xs" onClick={()=>setOpenId(detailOpen?null:ev.id)}>Detail</button>
                    <button disabled={deleting===ev.id} className="px-3 py-1 rounded border text-xs text-red-600 disabled:opacity-50" onClick={()=>onDelete(ev.id)}>
                      {deleting===ev.id? 'Menghapus...' : 'Hapus'}
                    </button>
                  </div>
                </td>
              </tr>
              {detailOpen && (
                <tr className="border-t bg-gray-50/50 dark:bg-gray-800/30">
                  <td colSpan={5} className="px-3 py-3">
                    <div className="text-sm">
                      <div><span className="opacity-70">Penguji:</span> <span className="font-medium">{ev.pengujiNama}</span></div>
                      <div><span className="opacity-70">Tanggal:</span> {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(d)}</div>
                      {ev.catatan && <div className="mt-1"><span className="opacity-70">Catatan:</span> {ev.catatan}</div>}
                    </div>
                  </td>
                </tr>
              )}
            </>
          )
        })}
          </>
        ))}
        {items.length === 0 && (
          <tr><td className="px-3 py-3 text-center opacity-70" colSpan={5}>Belum ada data</td></tr>
        )}
      </tbody>
    </table>
  )
}
