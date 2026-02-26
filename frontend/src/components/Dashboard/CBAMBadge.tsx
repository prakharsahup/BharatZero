"use client"

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import type { CalculationResult } from "@/types/emission"

interface CBAMBadgeProps {
  result: CalculationResult
}

const CONFIG = {
  green: {
    bg:      "bg-cbam-green",
    border:  "border-cbam-green",
    Icon:    CheckCircle,
    title:   "COMPLIANT ✓",
    subtext: (pct: number) => `Your carbon intensity is ${(100 - pct).toFixed(1)}% below the EU benchmark.`,
  },
  yellow: {
    bg:      "bg-cbam-yellow",
    border:  "border-cbam-yellow",
    Icon:    AlertTriangle,
    title:   "NEAR BENCHMARK ⚠",
    subtext: (pct: number) => `Your intensity is at ${pct}% of the EU benchmark. Improvements recommended.`,
  },
  red: {
    bg:      "bg-cbam-red",
    border:  "border-cbam-red",
    Icon:    XCircle,
    title:   "EXCEEDS BENCHMARK ✗",
    subtext: (pct: number) => `Your intensity is ${pct}% of the EU benchmark. CBAM carbon tax will apply.`,
  },
}

export default function CBAMBadge({ result }: CBAMBadgeProps) {
  const { status, percent_vs_benchmark } = result.cbam_status
  const cfg = CONFIG[status]
  const { Icon } = cfg

  return (
    <div className={`border-2 ${cfg.border} ${cfg.bg} p-6 text-white`}>
      <div className="flex items-start gap-4">
        <Icon className="h-7 w-7 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-bold text-xl uppercase tracking-wide leading-tight">
            {cfg.title}
          </p>
          <p className="text-sm opacity-90 mt-1">
            {cfg.subtext(percent_vs_benchmark)}
          </p>
        </div>
      </div>
    </div>
  )
}
