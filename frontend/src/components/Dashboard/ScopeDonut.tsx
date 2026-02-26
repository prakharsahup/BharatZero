"use client"

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { formatNumber } from "@/lib/utils"
import type { CalculationResult } from "@/types/emission"

const COLORS = ["#F4FF55", "#9FABA1"]

interface ScopeDonutProps {
  result: CalculationResult
}

export default function ScopeDonut({ result }: ScopeDonutProps) {
  const data = [
    { name: "Scope 1", value: result.scope1_kg_co2e },
    { name: "Scope 2", value: result.scope2_kg_co2e },
  ]

  const total = formatNumber(result.total_tco2e, 2)

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number
  }) => {
    if (percent < 0.03) return null
    const RADIAN = Math.PI / 180
    const r = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="#011D0F" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  return (
    <div>
      <p className="text-white/40 text-xs font-bold uppercase tracking-[0.15em] mb-4">
        Scope Breakdown
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
            isAnimationActive
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#011D0F",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 0,
              color: "#fff",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${formatNumber(value, 2)} kg CO₂e`, ""]}
          />
          <Legend
            formatter={(value, entry) => (
              <span style={{ color: (entry as { color?: string }).color, fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-white/20 text-xs mt-2">
        Total: <span className="text-lime font-semibold">{total} tCO₂e</span>
      </p>
    </div>
  )
}
