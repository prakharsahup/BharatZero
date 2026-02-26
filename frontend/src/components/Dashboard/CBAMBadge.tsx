"use client"

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import type { CalculationResult } from "@/types/emission"

interface CBAMBadgeProps {
  result: CalculationResult
}

const CONFIG = {
  green: {
    bg:      "bg-green-600",
    border:  "border-green-700",
    Icon:    CheckCircle,
    title:   "CBAM Ready",
    subtext: (pct: number) => `Your intensity is ${(100 - pct).toFixed(1)}% below the EU benchmark.`,
  },
  yellow: {
    bg:      "bg-yellow-500",
    border:  "border-yellow-600",
    Icon:    AlertTriangle,
    title:   "Near EU Benchmark",
    subtext: (pct: number) => `Your intensity is at ${pct}% of the EU benchmark. Improvements recommended.`,
  },
  red: {
    bg:      "bg-red-600",
    border:  "border-red-700",
    Icon:    XCircle,
    title:   "Exceeds EU Benchmark",
    subtext: (pct: number) => `Your intensity is ${pct}% of the EU benchmark. CBAM carbon tax will apply.`,
  },
}

export default function CBAMBadge({ result }: CBAMBadgeProps) {
  const { status, percent_vs_benchmark } = result.cbam_status
  const cfg = CONFIG[status]
  const { Icon } = cfg

  return (
    <div className={`rounded-lg border-2 ${cfg.bg} ${cfg.border} p-4 text-white`}>
      <div className="flex items-start gap-3">
        <Icon className="h-6 w-6 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-bold text-lg leading-tight">{cfg.title}</p>
          <p className="text-sm opacity-90 mt-0.5">{cfg.subtext(percent_vs_benchmark)}</p>
        </div>
      </div>
    </div>
  )
}
