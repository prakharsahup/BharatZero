"use client"

import { useState, useRef } from "react"
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { extractBillData } from "@/lib/api"
import type { ExtractedData } from "@/types/emission"

interface FileUploadProps {
  documentType: "electricity_bill" | "diesel_invoice"
  label: string
  onExtracted: (data: ExtractedData["extracted"]) => void
}

type UploadState = "idle" | "uploading" | "success" | "error"

export default function FileUpload({ documentType, label, onExtracted }: FileUploadProps) {
  const [state, setState]     = useState<UploadState>("idle")
  const [message, setMessage] = useState("")
  const fileInputRef          = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setState("uploading")
    setMessage("")
    try {
      const result = await extractBillData(file, documentType)
      onExtracted(result.extracted)
      setState("success")
      setMessage("Auto-filled from bill")
    } catch (err: unknown) {
      setState("error")
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Extraction failed. Try entering values manually."
      setMessage(msg)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const borderColor =
    state === "success" ? "border-cbam-green bg-cbam-green/5"  :
    state === "error"   ? "border-cbam-red bg-cbam-red/5"      :
                          "border-dashed border-foreground/20 hover:border-lime hover:bg-lime/5"

  return (
    <div className="mt-2">
      <div
        className={`relative flex flex-col items-center justify-center border px-4 py-3 cursor-pointer transition-colors ${borderColor}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
          className="sr-only"
          onChange={handleChange}
        />

        {state === "uploading" ? (
          <Loader2 className="h-4 w-4 animate-spin text-lime" />
        ) : state === "success" ? (
          <CheckCircle className="h-4 w-4 text-cbam-green" />
        ) : state === "error" ? (
          <AlertCircle className="h-4 w-4 text-cbam-red" />
        ) : (
          <Upload className="h-4 w-4 text-foreground/30" />
        )}

        <span className="mt-1 text-xs text-center text-foreground/40">
          {state === "uploading"
            ? "Extracting data…"
            : state === "success"
            ? message
            : state === "error"
            ? message
            : label}
        </span>
      </div>
    </div>
  )
}
