"use client"

import { formatNumber } from "@/lib/utils"
import type { CalculationResult } from "@/types/emission"

interface EmissionSummaryProps {
  result: CalculationResult
}

export default function EmissionSummary({ result }: EmissionSummaryProps) {
  const cards = [
    {
      label: "Scope 1 Emissions",
      value: formatNumber(result.scope1_kg_co2e / 1000, 4),
      unit:  "tCO₂e",
      accent: false,
    },
    {
      label: "Scope 2 Emissions",
      value: formatNumber(result.scope2_kg_co2e / 1000, 4),
      unit:  "tCO₂e",
      accent: false,
    },
    {
      label: "Total Emissions",
      value: formatNumber(result.total_tco2e, 4),
      unit:  "tCO₂e",
      accent: true,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-0 border border-white/10">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`p-6 ${i > 0 ? "border-l border-white/10" : ""}`}
        >
          <p className={`text-xs font-bold uppercase tracking-[0.15em] mb-3 ${
            card.accent ? "text-lime" : "text-white/40"
          }`}>
            {card.label}
          </p>
          <p className={`font-serif text-3xl md:text-4xl font-light tracking-tight ${
            card.accent ? "text-lime" : "text-white"
          }`}>
            {card.value}
          </p>
          <p className="text-white/20 text-xs mt-1 uppercase tracking-wide">{card.unit}</p>
        </div>
      ))}
    </div>
  )
}
