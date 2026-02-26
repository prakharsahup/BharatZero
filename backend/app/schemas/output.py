from pydantic import BaseModel


class CBAMStatus(BaseModel):
    status:                str    # "green" | "yellow" | "red"
    label:                 str
    your_intensity:        float
    eu_benchmark:          float
    percent_vs_benchmark:  float


class CalculationResult(BaseModel):
    session_id:      str
    scope1_kg_co2e:  float
    scope2_kg_co2e:  float
    total_kg_co2e:   float
    total_tco2e:     float
    intensity:       float
    cbam_status:     CBAMStatus


class ExtractedBillData(BaseModel):
    document_type: str
    extracted:     dict
    confidence:    str
