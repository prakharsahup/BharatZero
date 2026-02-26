"use client"

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { formatNumber } from "@/lib/utils"
import type { CalculationResult } from "@/types/emission"

const COLORS = ["#f97316", "#3b82f6"]

interface ScopeDonutProps {
  result: CalculationResult
}

export default function ScopeDonut({ result }: ScopeDonutProps) {
  const data = [
    { name: "Scope 1", value: result.scope1_kg_co2e },
    { name: "Scope 2", value: result.scope2_kg_co2e },
  ]

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number
  }) => {
    if (percent < 0.03) return null
    const RADIAN = Math.PI / 180
    const r = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Scope Breakdown</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
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
            formatter={(value: number) => [`${formatNumber(value, 2)} kg CO₂e`, ""]}
          />
          <Legend
            formatter={(value, entry) => (
              <span style={{ color: (entry as { color?: string }).color, fontSize: 12 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
