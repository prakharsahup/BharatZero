"use client"

import { formatNumber } from "@/lib/utils"
import type { CalculationResult } from "@/types/emission"

interface IntensityCardProps {
  result: CalculationResult
}

export default function IntensityCard({ result }: IntensityCardProps) {
  const { intensity, cbam_status } = result
  const { eu_benchmark, percent_vs_benchmark } = cbam_status

  // Width of the "your intensity" bar relative to benchmark
  const barPct = Math.min((intensity / eu_benchmark) * 100, 120)
  const barColor =
    cbam_status.status === "green"  ? "bg-cbam-green"  :
    cbam_status.status === "yellow" ? "bg-cbam-yellow" : "bg-cbam-red"

  return (
    <div className="space-y-6">
      <p className="text-white/40 text-xs font-bold uppercase tracking-[0.15em]">
        Carbon Intensity
      </p>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Your Facility</p>
          <p className="font-serif text-3xl font-light text-white tracking-tight">
            {formatNumber(intensity, 4)}
          </p>
          <p className="text-white/20 text-xs mt-1">tCO₂e / tonne</p>
        </div>
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">EU Benchmark</p>
          <p className="font-serif text-3xl font-light text-sage tracking-tight">
            {formatNumber(eu_benchmark, 2)}
          </p>
          <p className="text-white/20 text-xs mt-1">tCO₂e / tonne</p>
        </div>
      </div>

      {/* Comparison bar */}
      <div>
        <div className="flex justify-between text-xs text-white/30 mb-2">
          <span className="uppercase tracking-wide">Your intensity vs EU benchmark</span>
          <span className="font-bold text-white/60">{percent_vs_benchmark}%</span>
        </div>
        <div className="h-2 w-full bg-white/10 overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${barColor}`}
            style={{ width: `${barPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/20 mt-1">
          <span>0</span>
          <span>EU limit ({eu_benchmark})</span>
        </div>
      </div>
    </div>
  )
}
