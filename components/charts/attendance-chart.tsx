"use client"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export type AttendanceDataPoint = {
  date: string
  HADIR: number
  IZIN: number
  SAKIT: number
  ALPA: number
}

export default function AttendanceChart({ data, mode = 'percent' }: { data: AttendanceDataPoint[]; mode?: 'percent' | 'count' }) {
  const stackOffset = mode === 'percent' ? 'expand' : undefined
  const formatY = (v: number) => (mode === 'percent' ? `${Math.round(Number(v) * 100)}%` : String(v))
  const tooltipFormatter = (value: any) => (mode === 'percent' ? `${Math.round(Number(value) * 100)}%` : value)
  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} stackOffset={stackOffset as any}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} hide={data.length > 20} />
          <YAxis tickFormatter={formatY} allowDecimals={mode === 'percent'} />
          <Tooltip formatter={tooltipFormatter as any} />
          <Legend />
          <Bar dataKey="HADIR" stackId="a" fill="#10b981" />
          <Bar dataKey="IZIN" stackId="a" fill="#f59e0b" />
          <Bar dataKey="SAKIT" stackId="a" fill="#fb923c" />
          <Bar dataKey="ALPA" stackId="a" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
