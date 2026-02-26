export interface CBAMStatus {
  status: "green" | "yellow" | "red"
  label: string
  your_intensity: number
  eu_benchmark: number
  percent_vs_benchmark: number
}

export interface CalculationResult {
  session_id: string
  scope1_kg_co2e: number
  scope2_kg_co2e: number
  total_kg_co2e: number
  total_tco2e: number
  intensity: number
  cbam_status: CBAMStatus
}

export interface CalculationInput {
  company_name: string
  industry: string
  state: string
  kwh: number
  diesel_liters: number
  lpg_kg: number
  production_tonnes: number
}

export interface ExtractedData {
  document_type: string
  extracted: {
    kwh?: number
    state?: string
    month?: string
    liters?: number
    date?: string
  }
  confidence: string
}
