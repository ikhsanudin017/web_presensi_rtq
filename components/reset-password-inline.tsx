"use client"
import { useState } from 'react'

export default function ResetPasswordInline({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const submit = async () => {
    if (!pwd || pwd.length < 6) { setMsg('Minimal 6 karakter'); return }
    setLoading(true)
    setMsg(null)
    const res = await fetch(`/api/users/${userId}/password`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) })
    setLoading(false)
    if (res.ok) { setMsg('Password diperbarui'); setPwd(''); setOpen(false) }
    else setMsg((await res.json()).error || 'Gagal memperbarui')
  }

  return (
    <div className="flex items-center gap-2">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-primary hover:underline">Reset Password</button>
      ) : (
        <div className="flex items-center gap-2">
          <input type="password" className="border rounded px-2 py-1 bg-transparent text-sm" placeholder="Password baru" value={pwd} onChange={e=>setPwd(e.target.value)} />
          <button disabled={loading} onClick={submit} className="px-2 py-1 text-sm rounded bg-primary text-white disabled:opacity-50">Simpan</button>
          <button disabled={loading} onClick={() => { setOpen(false); setPwd(''); setMsg(null) }} className="px-2 py-1 text-sm rounded border">Batal</button>
        </div>
      )}
      {msg && <span className="text-xs opacity-70">{msg}</span>}
    </div>
  )
}

