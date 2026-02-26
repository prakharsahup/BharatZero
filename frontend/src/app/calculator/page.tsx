"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import InputForm       from "@/components/Calculator/InputForm"
import EmissionSummary from "@/components/Dashboard/EmissionSummary"
import ScopeDonut      from "@/components/Dashboard/ScopeDonut"
import IntensityCard   from "@/components/Dashboard/IntensityCard"
import CBAMBadge       from "@/components/Dashboard/CBAMBadge"
import DownloadButton  from "@/components/Dashboard/DownloadButton"
import type { CalculationResult } from "@/types/emission"

export default function CalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">GL</span>
          </div>
          <span className="font-bold text-gray-900 text-sm">GreenLedger Lite</span>
        </div>
        <span className="ml-auto text-xs text-gray-400 hidden sm:block">
          Scope 1 &amp; 2 · CBAM Calculator
        </span>
      </header>

      {/* Two-column layout */}
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left panel: Input form ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Enter Activity Data</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your energy consumption manually or upload bills for auto-fill.
          </p>
          <InputForm onResult={setResult} />
        </div>

        {/* ── Right panel: Results dashboard ── */}
        <div className="space-y-4">
          {result === null ? (
            /* Placeholder before first calculation */
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border-2 border-dashed border-gray-200 text-center p-10 bg-white">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-3xl">🌿</span>
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Results will appear here</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Fill in your energy data on the left and click &ldquo;Calculate Emissions&rdquo; to see
                your Scope 1 &amp; 2 breakdown, carbon intensity, and CBAM status.
              </p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <EmissionSummary result={result} />

              {/* Donut chart */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <ScopeDonut result={result} />
              </div>

              {/* Intensity comparison */}
              <IntensityCard result={result} />

              {/* CBAM badge */}
              <CBAMBadge result={result} />

              {/* PDF download */}
              <DownloadButton sessionId={result.session_id} />

              <p className="text-xs text-gray-400 text-center px-4">
                Calculations use CEA 2022-23, IPCC AR6, and GHG Protocol. Verify with a qualified
                professional before official CBAM submission.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
