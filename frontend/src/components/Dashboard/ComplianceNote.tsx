"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle, Loader2, ShieldAlert, Sparkles } from "lucide-react"
import { getComplianceNote, type ComplianceNote } from "@/lib/api"

interface Props {
  sessionId: string
}

const RISK_CONFIG = {
  low:    { label: "Low Risk",    className: "bg-cbam-green/15 text-cbam-green border-cbam-green/30",   Icon: CheckCircle  },
  medium: { label: "Medium Risk", className: "bg-cbam-yellow/15 text-cbam-yellow border-cbam-yellow/30", Icon: AlertTriangle },
  high:   { label: "High Risk",   className: "bg-cbam-red/15 text-cbam-red border-cbam-red/30",         Icon: ShieldAlert  },
}

export default function ComplianceNote({ sessionId }: Props) {
  const [note, setNote]       = useState<ComplianceNote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")

  useEffect(() => {
    getComplianceNote(sessionId)
      .then(setNote)
      .catch((err) => {
        const status = (err as { response?: { status?: number } })?.response?.status
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        setError(
          status === 429
            ? "Gemini API quota exceeded — compliance analysis unavailable right now."
            : detail || "Compliance analysis failed."
        )
      })
      .finally(() => setLoading(false))
  }, [sessionId])

  const riskCfg = note ? (RISK_CONFIG[note.risk_level] ?? RISK_CONFIG.medium) : null

  return (
    <div className="border border-white/10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-lime" />
          <span className="text-white/70 text-xs font-bold uppercase tracking-widest">
            AI Compliance Analysis
          </span>
        </div>
        <span className="text-white/20 text-xs uppercase tracking-widest font-bold">
          Powered by Gemini
        </span>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <Loader2 className="h-5 w-5 text-lime animate-spin" />
          <p className="text-white/30 text-xs uppercase tracking-widest font-bold">
            Analysing CBAM compliance…
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="px-5 py-8 text-center">
          <p className="text-cbam-red/70 text-xs uppercase tracking-widest font-bold">{error}</p>
        </div>
      )}

      {/* ── Content ── */}
      {!loading && !error && note && riskCfg && (
        <div className="p-6 space-y-6">

          {/* Risk badge + summary */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <span className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-bold uppercase tracking-wide shrink-0 ${riskCfg.className}`}>
              <riskCfg.Icon className="h-3.5 w-3.5" />
              {riskCfg.label}
            </span>
            <p className="text-white/70 text-sm leading-relaxed">{note.summary}</p>
          </div>

          <div className="border-t border-white/10" />

          {/* Key risks + Recommendations side by side */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Key Risks */}
            <div>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">
                Key Risk Areas
              </p>
              <div className="space-y-3">
                {note.key_risks.map((risk, i) => (
                  <div key={i} className="border-l-2 border-cbam-yellow/40 pl-3">
                    <p className="text-white/80 text-xs font-bold uppercase tracking-wide mb-0.5">
                      {risk.area}
                    </p>
                    <p className="text-white/50 text-xs leading-relaxed">{risk.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">
                Recommended Actions
              </p>
              <ol className="space-y-2">
                {note.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="text-lime font-serif text-base leading-none mt-0.5 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-white/60 text-xs leading-relaxed">{rec}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Phase note */}
          <div className="flex items-start gap-2.5 bg-lime/5 border border-lime/20 px-4 py-3">
            <span className="text-lime text-xs font-bold uppercase tracking-widest shrink-0 mt-px">
              2026
            </span>
            <p className="text-white/50 text-xs leading-relaxed">{note.phase_note}</p>
          </div>

          <p className="text-white/15 text-xs">
            AI-generated analysis. Verify with a qualified CBAM compliance professional before official submission.
          </p>
        </div>
      )}
    </div>
  )
}
