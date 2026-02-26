import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatTCO2e(value: number, decimals = 4): string {
  return `${formatNumber(value, decimals)} tCO₂e`
}

export function formatKgCO2e(value: number): string {
  return `${formatNumber(value, 2)} kg CO₂e`
}
