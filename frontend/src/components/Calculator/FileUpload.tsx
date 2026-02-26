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
    state === "success" ? "border-green-400 bg-green-50" :
    state === "error"   ? "border-red-400 bg-red-50"   :
                          "border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50"

  return (
    <div className="mt-1">
      <div
        className={`relative flex flex-col items-center justify-center rounded-md border-2 px-4 py-3 cursor-pointer transition-colors ${borderColor}`}
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
          <Loader2 className="h-5 w-5 animate-spin text-green-600" />
        ) : state === "success" ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : state === "error" ? (
          <AlertCircle className="h-5 w-5 text-red-500" />
        ) : (
          <Upload className="h-5 w-5 text-gray-400" />
        )}

        <span className="mt-1 text-xs text-center text-gray-500">
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
