"use client"
import { useState } from 'react'
import AttendanceChart, { type AttendanceDataPoint } from './attendance-chart'

export default function ChartModeToggle({ data }: { data: AttendanceDataPoint[] }) {
  const [mode, setMode] = useState<'percent' | 'count'>('percent')
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">Mode:</span>
        <div className="inline-flex rounded border overflow-hidden">
          <button className={`px-3 py-1 text-sm ${mode==='percent'?'bg-primary text-white':''}`} onClick={()=>setMode('percent')}>Persen</button>
          <button className={`px-3 py-1 text-sm ${mode==='count'?'bg-primary text-white':''}`} onClick={()=>setMode('count')}>Jumlah</button>
        </div>
      </div>
      <AttendanceChart data={data} mode={mode} />
    </div>
  )
}
