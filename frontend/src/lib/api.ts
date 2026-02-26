import axios from "axios"
import type { CalculationInput, CalculationResult, ExtractedData } from "@/types/emission"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 60_000,
})

export async function calculate(input: CalculationInput): Promise<CalculationResult> {
  const { data } = await api.post<CalculationResult>("/api/calculate", input)
  return data
}

export async function extractBillData(
  file: File,
  documentType: "electricity_bill" | "diesel_invoice"
): Promise<ExtractedData> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("document_type", documentType)

  const { data } = await api.post<ExtractedData>("/api/extract", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function downloadReport(sessionId: string): Promise<Blob> {
  const { data } = await api.post(
    "/api/report",
    { session_id: sessionId },
    { responseType: "blob" }
  )
  return data
}
