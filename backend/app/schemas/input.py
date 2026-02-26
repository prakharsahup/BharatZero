from pydantic import BaseModel, Field


class CalculationInput(BaseModel):
    company_name:      str   = Field(default="", description="Company / facility name")
    industry:          str   = Field(..., description="Industry type: steel, aluminium, cement, textile, chemicals")
    state:             str   = Field(..., description="Indian state key for grid factor lookup")
    kwh:               float = Field(..., ge=0, description="Electricity consumed in kWh")
    diesel_liters:     float = Field(default=0, ge=0, description="Diesel consumed in litres")
    lpg_kg:            float = Field(default=0, ge=0, description="LPG consumed in kg")
    production_tonnes: float = Field(..., gt=0, description="Production quantity in tonnes")


class ReportRequest(BaseModel):
    session_id: str = Field(..., description="Session ID returned by /api/calculate")
