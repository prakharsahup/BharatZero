"use client"

import { useEffect, useState } from "react"
import { FileText, Loader2 } from "lucide-react"
import { downloadReport } from "@/lib/api"

interface PDFPreviewProps {
  sessionId: string
}

export default function PDFPreview({ sessionId }: PDFPreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null

    downloadReport(sessionId)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [sessionId])

  return (
    <div className="border border-white/10">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-lime" />
          <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
            Report Preview
          </span>
        </div>
        <span className="text-white/20 text-xs uppercase tracking-widest font-bold">
          CBAM · PDF
        </span>
      </div>

      {/* Preview body */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-[680px] bg-white/[0.03]">
          <Loader2 className="h-6 w-6 text-lime animate-spin mb-3" />
          <p className="text-white/30 text-xs uppercase tracking-widest font-bold">
            Generating preview…
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center h-[200px] bg-white/[0.03]">
          <p className="text-white/30 text-xs uppercase tracking-widest font-bold">
            Preview unavailable — click Download below
          </p>
        </div>
      )}

      {!loading && !error && blobUrl && (
        <iframe
          src={blobUrl}
          title="CBAM Report Preview"
          className="w-full"
          style={{ height: "680px" }}
        />
      )}
    </div>
  )
}
