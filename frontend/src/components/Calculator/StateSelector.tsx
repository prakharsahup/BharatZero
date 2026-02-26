"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const INDIAN_STATES = [
  { value: "andhra_pradesh",   label: "Andhra Pradesh" },
  { value: "assam",            label: "Assam" },
  { value: "bihar",            label: "Bihar" },
  { value: "chhattisgarh",     label: "Chhattisgarh" },
  { value: "gujarat",          label: "Gujarat" },
  { value: "haryana",          label: "Haryana" },
  { value: "himachal_pradesh", label: "Himachal Pradesh" },
  { value: "jharkhand",        label: "Jharkhand" },
  { value: "karnataka",        label: "Karnataka" },
  { value: "kerala",           label: "Kerala" },
  { value: "madhya_pradesh",   label: "Madhya Pradesh" },
  { value: "maharashtra",      label: "Maharashtra" },
  { value: "odisha",           label: "Odisha" },
  { value: "punjab",           label: "Punjab" },
  { value: "rajasthan",        label: "Rajasthan" },
  { value: "tamil_nadu",       label: "Tamil Nadu" },
  { value: "telangana",        label: "Telangana" },
  { value: "uttarakhand",      label: "Uttarakhand" },
  { value: "uttar_pradesh",    label: "Uttar Pradesh" },
  { value: "west_bengal",      label: "West Bengal" },
  { value: "national",         label: "Other / National Average" },
]

interface StateSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function StateSelector({ value, onChange }: StateSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select state..." />
      </SelectTrigger>
      <SelectContent>
        {INDIAN_STATES.map((state) => (
          <SelectItem key={state.value} value={state.value}>
            {state.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
