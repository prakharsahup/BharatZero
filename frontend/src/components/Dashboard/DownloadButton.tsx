"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadReport } from "@/lib/api"

interface DownloadButtonProps {
  sessionId: string
}

export default function DownloadButton({ sessionId }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  async function handleDownload() {
    setLoading(true)
    setError("")
    try {
      const blob = await downloadReport(sessionId)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href     = url
      a.download = `cbam_report_${sessionId.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError("PDF generation failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleDownload}
        disabled={loading}
        variant="lime"
        size="xl"
        className="w-full text-base"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating PDF…
          </>
        ) : (
          <>
            <Download className="mr-2 h-5 w-5" />
            Download CBAM Report PDF
          </>
        )}
      </Button>
      {error && <p className="mt-2 text-xs text-cbam-red text-center">{error}</p>}
    </div>
  )
}
