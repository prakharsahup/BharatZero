"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"
import type { CalculationResult } from "@/types/emission"

interface EmissionSummaryProps {
  result: CalculationResult
}

export default function EmissionSummary({ result }: EmissionSummaryProps) {
  const cards = [
    {
      label: "Total Emissions",
      value: formatNumber(result.total_tco2e, 4),
      unit:  "tCO₂e",
      bg:    "bg-gray-900 text-white",
      size:  "text-3xl",
    },
    {
      label: "Scope 1 (Direct)",
      value: formatNumber(result.scope1_kg_co2e / 1000, 4),
      unit:  "tCO₂e",
      bg:    "bg-orange-50 border border-orange-200",
      size:  "text-2xl",
    },
    {
      label: "Scope 2 (Electricity)",
      value: formatNumber(result.scope2_kg_co2e / 1000, 4),
      unit:  "tCO₂e",
      bg:    "bg-blue-50 border border-blue-200",
      size:  "text-2xl",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className={`${card.bg} shadow-none`}>
          <CardContent className="p-4">
            <p className="text-xs font-medium opacity-70 uppercase tracking-wide mb-1">
              {card.label}
            </p>
            <p className={`${card.size} font-bold leading-tight`}>{card.value}</p>
            <p className="text-xs opacity-60 mt-0.5">{card.unit}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
