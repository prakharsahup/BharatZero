"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Label }  from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import StateSelector from "./StateSelector"
import FileUpload    from "./FileUpload"
import { calculate } from "@/lib/api"
import type { CalculationInput, CalculationResult } from "@/types/emission"

const INDUSTRIES = [
  { value: "steel",     label: "Steel" },
  { value: "aluminium", label: "Aluminium" },
  { value: "cement",    label: "Cement" },
  { value: "textile",   label: "Textile" },
  { value: "chemicals", label: "Chemicals" },
]

interface InputFormProps {
  onResult: (result: CalculationResult) => void
}

export default function InputForm({ onResult }: InputFormProps) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const { register, handleSubmit, control, setValue, formState: { errors } } =
    useForm<CalculationInput>({
      defaultValues: {
        company_name:      "",
        industry:          "steel",
        state:             "tamil_nadu",
        kwh:               0,
        diesel_liters:     0,
        lpg_kg:            0,
        production_tonnes: 0,
      },
    })

  async function onSubmit(data: CalculationInput) {
    setLoading(true)
    setError("")
    try {
      const result = await calculate(data)
      onResult(result)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Calculation failed. Please check your inputs and try again."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* ── Company Name ── */}
      <div className="space-y-2">
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          placeholder="e.g. ABC Steel Works"
          {...register("company_name")}
        />
      </div>

      {/* ── Two-column Grid ── */}
      <div className="grid md:grid-cols-2 gap-0">
        {/* LEFT: Production Details */}
        <div className="md:pr-8 md:border-r border-foreground/10 space-y-6 pb-8 md:pb-0">
          <div className="border-b border-foreground/10 pb-3 mb-6">
            <p className="text-sage text-xs font-bold uppercase tracking-[0.15em]">
              Production Details
            </p>
          </div>

          <div className="space-y-2">
            <Label>Industry</Label>
            <Controller
              name="industry"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>State</Label>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <StateSelector value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="production_tonnes">Production Output (tonnes)</Label>
            <Input
              id="production_tonnes"
              type="number"
              min={0.01}
              step="any"
              placeholder="e.g. 500"
              {...register("production_tonnes", {
                valueAsNumber: true,
                required:      "Production quantity is required",
                min:           { value: 0.01, message: "Must be > 0" },
              })}
            />
            {errors.production_tonnes && (
              <p className="text-xs text-cbam-red">{errors.production_tonnes.message}</p>
            )}
          </div>
        </div>

        {/* RIGHT: Energy Consumption */}
        <div className="md:pl-8 space-y-6 pt-8 md:pt-0 border-t md:border-t-0 border-foreground/10">
          <div className="border-b border-foreground/10 pb-3 mb-6">
            <p className="text-sage text-xs font-bold uppercase tracking-[0.15em]">
              Energy Consumption
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kwh">Electricity Consumed (kWh)</Label>
            <Input
              id="kwh"
              type="number"
              min={0}
              step="any"
              placeholder="e.g. 150000"
              {...register("kwh", { valueAsNumber: true, required: "kWh is required", min: { value: 0, message: "Must be ≥ 0" } })}
            />
            {errors.kwh && <p className="text-xs text-cbam-red">{errors.kwh.message}</p>}
            <FileUpload
              documentType="electricity_bill"
              label="Upload electricity bill — auto-fill kWh"
              onExtracted={(data) => {
                if (data.kwh)   setValue("kwh",   data.kwh)
                if (data.state) setValue("state", data.state.toLowerCase().replace(/ /g, "_"))
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diesel_liters">Diesel Used (liters)</Label>
            <Input
              id="diesel_liters"
              type="number"
              min={0}
              step="any"
              placeholder="e.g. 5000"
              {...register("diesel_liters", { valueAsNumber: true, min: { value: 0, message: "Must be ≥ 0" } })}
            />
            <FileUpload
              documentType="diesel_invoice"
              label="Upload diesel invoice — auto-fill litres"
              onExtracted={(data) => {
                if (data.liters) setValue("diesel_liters", data.liters)
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lpg_kg">
              LPG Used (kg) <span className="text-sage font-normal normal-case tracking-normal">(Optional)</span>
            </Label>
            <Input
              id="lpg_kg"
              type="number"
              min={0}
              step="any"
              placeholder="0"
              {...register("lpg_kg", { valueAsNumber: true, min: 0 })}
            />
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="border border-cbam-red/30 bg-cbam-red/5 p-4 text-sm text-cbam-red">
          {error}
        </div>
      )}

      {/* ── Submit Button ── */}
      <Button type="submit" variant="lime" size="xl" className="w-full text-base" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Calculating…
          </>
        ) : (
          <>
            Calculate Emissions
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  )
}
