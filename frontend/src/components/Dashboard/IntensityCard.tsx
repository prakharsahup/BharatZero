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
  const barPct = Math.min((intensity / eu_benchmark) * 100, 100)
  const barColor =
    cbam_status.status === "green"  ? "bg-green-500"  :
    cbam_status.status === "yellow" ? "bg-yellow-500" : "bg-red-500"

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Carbon Intensity</h3>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Your Facility</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {formatNumber(intensity, 4)}
          </p>
          <p className="text-xs text-gray-400">tCO₂e / tonne</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">EU Benchmark</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {formatNumber(eu_benchmark, 2)}
          </p>
          <p className="text-xs text-gray-400">tCO₂e / tonne</p>
        </div>
      </div>

      {/* Comparison bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Your intensity vs EU benchmark</span>
          <span className="font-semibold">{percent_vs_benchmark}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${barPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>0</span>
          <span>EU limit ({eu_benchmark})</span>
        </div>
      </div>
    </div>
  )
}
