import axios from "axios"
import type { CalculationInput, CalculationResult, ExtractedData } from "@/types/emission"
import { supabase } from "./supabase"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 60_000,
})

// Attach the Supabase JWT to every request automatically
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
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

export interface HistoryEntry {
  session_id:           string
  company_name:         string | null
  industry:             string | null
  state:                string | null
  total_tco2e:          number
  intensity:            number
  cbam_color:           string   // "green" | "yellow" | "red"
  cbam_label:           string
  percent_vs_benchmark: number
  created_at:           string
}

export async function getCalculations(): Promise<HistoryEntry[]> {
  const { data } = await api.get<HistoryEntry[]>("/api/calculations")
  return data
}

export interface ComplianceRisk {
  area: string
  detail: string
}

export interface ComplianceNote {
  summary: string
  risk_level: "low" | "medium" | "high"
  key_risks: ComplianceRisk[]
  recommendations: string[]
  phase_note: string
}

export async function getComplianceNote(sessionId: string): Promise<ComplianceNote> {
  const { data } = await api.post<ComplianceNote>(
    "/api/compliance",
    { session_id: sessionId },
    { timeout: 30_000 },   // 30s — fast-fail if Gemini quota is hit
  )
  return data
}
