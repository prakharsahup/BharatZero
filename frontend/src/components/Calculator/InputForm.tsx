"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Loader2 } from "lucide-react"
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Company info */}
      <div className="space-y-1">
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          placeholder="e.g. ABC Steel Works"
          {...register("company_name")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
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

        <div className="space-y-1">
          <Label>State</Label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <StateSelector value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {/* Electricity section */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-800">Electricity (Scope 2)</p>
        <div className="space-y-1">
          <Label htmlFor="kwh">Units Consumed (kWh)</Label>
          <Input
            id="kwh"
            type="number"
            min={0}
            step="any"
            placeholder="e.g. 12400"
            {...register("kwh", { valueAsNumber: true, required: "kWh is required", min: { value: 0, message: "Must be ≥ 0" } })}
          />
          {errors.kwh && <p className="text-xs text-red-500">{errors.kwh.message}</p>}
        </div>
        <FileUpload
          documentType="electricity_bill"
          label="Upload electricity bill — auto-fill kWh"
          onExtracted={(data) => {
            if (data.kwh)   setValue("kwh",   data.kwh)
            if (data.state) setValue("state", data.state.toLowerCase().replace(/ /g, "_"))
          }}
        />
      </div>

      {/* Diesel section */}
      <div className="rounded-lg border border-orange-100 bg-orange-50 p-4 space-y-2">
        <p className="text-sm font-semibold text-orange-800">Diesel (Scope 1)</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="diesel_liters">Litres Purchased</Label>
            <Input
              id="diesel_liters"
              type="number"
              min={0}
              step="any"
              placeholder="e.g. 580"
              {...register("diesel_liters", { valueAsNumber: true, min: { value: 0, message: "Must be ≥ 0" } })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lpg_kg">LPG (kg)</Label>
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
        <FileUpload
          documentType="diesel_invoice"
          label="Upload diesel invoice — auto-fill litres"
          onExtracted={(data) => {
            if (data.liters) setValue("diesel_liters", data.liters)
          }}
        />
      </div>

      {/* Production */}
      <div className="space-y-1">
        <Label htmlFor="production_tonnes">Production Quantity (tonnes)</Label>
        <Input
          id="production_tonnes"
          type="number"
          min={0.01}
          step="any"
          placeholder="e.g. 200"
          {...register("production_tonnes", {
            valueAsNumber: true,
            required:      "Production quantity is required",
            min:           { value: 0.01, message: "Must be > 0" },
          })}
        />
        {errors.production_tonnes && (
          <p className="text-xs text-red-500">{errors.production_tonnes.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full text-base py-5" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Calculating…
          </>
        ) : (
          "Calculate Emissions"
        )}
      </Button>
    </form>
  )
}
