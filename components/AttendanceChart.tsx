"use client"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export type AttendancePoint = {
  date: string
  hadir: number
  izin: number
  sakit: number
  alpa: number
}

export default function AttendanceChart({ data }: { data: AttendancePoint[] }) {
  if (!data?.length) {
    return (
      <div className="h-52 grid place-items-center text-sm text-gray-500">Belum ada data presensi</div>
    )
  }
  return (
    <div className="w-full h-56 md:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gHadir" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gAlpa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} width={28} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="hadir" name="Hadir" stroke="#22c55e" fillOpacity={1} fill="url(#gHadir)" />
          <Area type="monotone" dataKey="alpa" name="Alpa" stroke="#ef4444" fillOpacity={1} fill="url(#gAlpa)" />
          <Area type="monotone" dataKey="izin" name="Izin" stroke="#f59e0b" fill="#fed7aa" fillOpacity={0.3} />
          <Area type="monotone" dataKey="sakit" name="Sakit" stroke="#3b82f6" fill="#bfdbfe" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
