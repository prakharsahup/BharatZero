"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, BarChart2 } from "lucide-react"
import { useAuth } from "@/lib/auth"
import InputForm       from "@/components/Calculator/InputForm"
import EmissionSummary from "@/components/Dashboard/EmissionSummary"
import ScopeDonut      from "@/components/Dashboard/ScopeDonut"
import IntensityCard   from "@/components/Dashboard/IntensityCard"
import CBAMBadge       from "@/components/Dashboard/CBAMBadge"
import DownloadButton  from "@/components/Dashboard/DownloadButton"
import type { CalculationResult } from "@/types/emission"
import type { StoredResult } from "@/app/results/page"

export default function CalculatorPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [result, setResult] = useState<CalculationResult | null>(null)

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login")
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const handleResult = (res: CalculationResult) => {
    // Persist to localStorage so the Results page can display history
    try {
      const existing: StoredResult[] = JSON.parse(localStorage.getItem("bz_results") || "[]")
      const entry: StoredResult = {
        timestamp:   new Date().toISOString(),
        companyName: "",   // InputForm doesn't expose these — will be populated when Supabase is connected
        industry:    "",
        state:       "",
        result:      res,
      }
      existing.unshift(entry)
      localStorage.setItem("bz_results", JSON.stringify(existing.slice(0, 50)))
    } catch { /* ignore */ }
    setResult(res)
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* ═══════════ STICKY NAV ═══════════ */}
      <nav className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest hover:text-lime transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/results"
              className="hidden sm:flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest hover:text-lime transition-colors"
            >
              <BarChart2 className="h-4 w-4" />
              My Results
            </Link>
          </div>
          <Link href="/">
            <span className="text-lime font-serif text-xl font-semibold tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
              BharatZero
            </span>
          </Link>
          <span className="text-white/30 text-xs font-bold uppercase tracking-widest hidden sm:block">
            Calculator
          </span>
        </div>
      </nav>

      {/* ═══════════ PAGE HEADER ═══════════ */}
      <header className="bg-dark-bg bg-grid-pattern text-white py-12 md:py-16 px-6 border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-lime text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Carbon Emission Calculator
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-architectural leading-[0.95]">
            Calculate Your Emissions
          </h1>
          <p className="text-white/40 text-base mt-4 max-w-2xl">
            Enter your production data below. All calculations use India-specific IPCC emission
            factors and state-level CEA grid factors.
          </p>
        </div>
      </header>

      {/* ═══════════ DATA INPUT SECTION ═══════════ */}
      <section className="bg-cream py-12 md:py-16 px-6 border-b border-foreground/10">
        <div className="max-w-5xl mx-auto">
          <InputForm onResult={handleResult} />
        </div>
      </section>

      {/* ═══════════ RESULTS SECTION ═══════════ */}
      <section className="bg-dark-bg text-white py-12 md:py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {result === null ? (
            <div className="flex flex-col items-center justify-center min-h-[320px] border border-white/10 text-center p-12">
              <div className="h-16 w-16 border border-white/20 flex items-center justify-center mb-6">
                <span className="text-3xl">🌿</span>
              </div>
              <h3 className="font-serif text-2xl font-light text-white/60 mb-3">
                Results Will Appear Here
              </h3>
              <p className="text-white/30 text-sm max-w-md">
                Fill in your energy data above and click &ldquo;Calculate Emissions&rdquo; to see
                your Scope 1 &amp; 2 breakdown, carbon intensity, and CBAM status.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <EmissionSummary result={result} />
              <div className="grid md:grid-cols-2 gap-0 border border-white/10">
                <div className="p-6 md:border-r border-white/10">
                  <ScopeDonut result={result} />
                </div>
                <div className="p-6 border-t md:border-t-0 border-white/10">
                  <IntensityCard result={result} />
                </div>
              </div>
              <CBAMBadge result={result} />
              <DownloadButton sessionId={result.session_id} />
              <div className="border-t border-white/10 pt-6">
                <p className="text-white/20 text-xs uppercase tracking-widest mb-2 font-bold">
                  Methodology
                </p>
                <p className="text-white/30 text-xs leading-relaxed max-w-2xl">
                  Calculations use India&apos;s Central Electricity Authority (CEA) state-level grid emission
                  factors and IPCC 2006 combustion emission factors for diesel and LPG. Industry
                  benchmarks are sourced from EU CBAM Implementing Regulation (EU) 2023/956. Verify
                  with a qualified professional before official submission.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-dark-bg border-t border-white/10">
        <div className="bg-lime px-6 py-3">
          <p className="text-dark-bg text-xs font-semibold text-center tracking-wide">
            © 2025 BharatZero. All rights reserved. Built for Indian MSMEs 🇮🇳
          </p>
        </div>
      </footer>
    </div>
  )
}
