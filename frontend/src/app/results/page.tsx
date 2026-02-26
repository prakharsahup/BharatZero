"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Leaf, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { getCalculations, type HistoryEntry } from "@/lib/api"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(color: string) {
  if (color === "green")  return "text-cbam-green border-cbam-green/40 bg-cbam-green/10"
  if (color === "yellow") return "text-cbam-yellow border-cbam-yellow/40 bg-cbam-yellow/10"
  return "text-cbam-red border-cbam-red/40 bg-cbam-red/10"
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [results, setResults] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) router.replace("/login")
  }, [isAuthenticated, router])

  // Fetch from backend
  useEffect(() => {
    if (!isAuthenticated) return
    setLoading(true)
    getCalculations()
      .then(setResults)
      .catch(() => setError("Failed to load calculations. Please try again."))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  if (!isAuthenticated) return null

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
          </div>
          <Link href="/">
            <span className="text-lime font-serif text-xl font-semibold tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
              BharatZero
            </span>
          </Link>
          <span className="text-white/30 text-xs font-bold uppercase tracking-widest hidden sm:block">
            My Results
          </span>
        </div>
      </nav>

      {/* ═══════════ PAGE HEADER ═══════════ */}
      <header className="bg-dark-bg bg-grid-pattern text-white py-12 md:py-16 px-6 border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-lime text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Calculation History
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight leading-[0.95]">
            My Results
          </h1>
          <p className="text-white/40 text-base mt-4 max-w-2xl">
            {user?.name ? `Welcome back, ${user.name}.` : ""} All your past CBAM emission calculations in one place.
          </p>
        </div>
      </header>

      {/* ═══════════ RESULTS LIST ═══════════ */}
      <section className="py-12 md:py-16 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center min-h-[360px]">
              <RefreshCw className="h-6 w-6 text-foreground/30 animate-spin" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-cbam-red text-sm border border-cbam-red/30 bg-cbam-red/5 px-6 py-4">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && results.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[360px] border border-foreground/10 text-center p-12 bg-white/30">
              <div className="h-16 w-16 border border-foreground/20 flex items-center justify-center mb-6">
                <Leaf className="h-7 w-7 text-foreground/30" />
              </div>
              <h3 className="font-serif text-2xl font-light text-foreground/50 mb-3">
                No Calculations Yet
              </h3>
              <p className="text-foreground/40 text-sm max-w-sm mb-8">
                Run your first CBAM emission calculation and your results will be saved here automatically.
              </p>
              <Link href="/calculator">
                <Button variant="lime" size="default">
                  Open Calculator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {/* Results table */}
          {!loading && !error && results.length > 0 && (
            <div className="space-y-0">
              {/* Header row */}
              <div className="hidden md:grid grid-cols-[1fr_120px_120px_140px_80px] gap-4 px-6 py-3 bg-dark-bg text-white/40 text-xs font-bold uppercase tracking-widest">
                <span>Company / Industry</span>
                <span className="text-right">Total (tCO₂e)</span>
                <span className="text-right">Intensity</span>
                <span className="text-right">CBAM Status</span>
                <span className="text-right">Date</span>
              </div>

              {results.map((entry) => (
                <div
                  key={entry.session_id}
                  className="grid md:grid-cols-[1fr_120px_120px_140px_80px] gap-4 items-center px-6 py-5 border border-foreground/10 bg-cream hover:bg-sage/10 transition-colors"
                >
                  {/* Company / Industry */}
                  <div>
                    <p className="font-bold text-dark-bg uppercase tracking-wide text-sm">
                      {entry.company_name || "—"}
                    </p>
                    <p className="text-foreground/50 text-xs mt-1 capitalize">
                      {entry.industry} · {entry.state?.replace(/_/g, " ")}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <p className="font-bold text-dark-bg text-base font-serif">
                      {entry.total_tco2e?.toFixed(3) ?? "—"}
                    </p>
                    <p className="text-foreground/40 text-xs">tCO₂e</p>
                  </div>

                  {/* Intensity */}
                  <div className="text-right">
                    <p className="font-bold text-dark-bg text-sm font-serif">
                      {entry.intensity?.toFixed(4) ?? "—"}
                    </p>
                    <p className="text-foreground/40 text-xs">tCO₂e/t</p>
                  </div>

                  {/* CBAM Badge */}
                  <div className="flex md:justify-end">
                    <span className={`inline-block border px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusColor(entry.cbam_color)}`}>
                      {entry.cbam_label}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="text-right">
                    <p className="text-foreground/50 text-xs">{formatDate(entry.created_at)}</p>
                  </div>
                </div>
              ))}

              {/* Footer CTA */}
              <div className="pt-8 flex items-center justify-between">
                <p className="text-foreground/40 text-xs uppercase tracking-widest font-bold">
                  {results.length} calculation{results.length !== 1 ? "s" : ""} saved
                </p>
                <Link href="/calculator">
                  <Button variant="lime" size="sm">
                    New Calculation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-dark-bg border-t border-white/10 mt-auto">
        <div className="bg-lime px-6 py-3">
          <p className="text-dark-bg text-xs font-semibold text-center tracking-wide">
            © 2025 BharatZero. All rights reserved. Built for Indian MSMEs 🇮🇳
          </p>
        </div>
      </footer>
    </div>
  )
}
