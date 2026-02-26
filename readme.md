Terminal 1 (Backend)
cd P:\ECodeathon\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
Terminal 2 (Frontend)
cd P:\ECodeathon\frontend
npm run dev

# 🌿 GreenLedger Lite — CBAM Carbon Calculator for Indian Exporters

> An AI-powered Scope 1 & 2 carbon reporting tool that helps Indian MSMEs calculate their embedded carbon emissions and check CBAM compliance — built for a 48-hour hackathon.

**Pitch line:** _"We automated CBAM carbon reporting for Indian exporters. Upload your electricity bill and diesel invoice. Get a compliance-ready report in 60 seconds."_

---

## 📋 Table of Contents

- [What This Is](#what-this-is)
- [What This Is NOT](#what-this-is-not)
- [Problem Statement](#problem-statement)
- [Architecture](#architecture)
- [Control Flow](#control-flow)
- [Tech Stack](#tech-stack)
- [File & Folder Structure](#file--folder-structure)
- [Emission Calculation Engine](#emission-calculation-engine)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend Pages & Components](#frontend-pages--components)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Deployment](#deployment)
- [48-Hour Build Plan](#48-hour-build-plan)Fin
- [Pitch Strategy](#pitch-strategy)
- [Roadmap Post-Hackathon](#roadmap-post-hackathon)

---

## What This Is

A single-page web app where an Indian MSME exporter can:

1. Upload an electricity bill (PDF/image) **or** manually enter kWh
2. Upload a diesel invoice (PDF/image) **or** manually enter liters
3. Enter monthly production quantity (tonnes)
4. Instantly see their Scope 1 + Scope 2 carbon emissions
5. Download a CBAM-ready PDF report

That is it. Nothing else for the hackathon.

---

## What This Is NOT

To be explicit about what is **not** being built:

- No multi-tenant SaaS or user auth
- No Scope 3 or supply chain emissions
- No Neo4j knowledge graph
- No Celery async task queues
- No supplier portal or scoring
- No BRSR compliance module
- No complex risk scoring engine
- No ERP integrations
- No cloud file storage (Cloudinary, S3)
- No audit logging

These are Phase 2. Judges want a **working demo**, not enterprise architecture.

---

## Problem Statement

| Reality                                            | Impact                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| EU CBAM came into full effect January 2026         | Indian exporters of steel, cement, aluminium must report embedded carbon or face border tax |
| Average MSME has zero carbon accounting capability | They lose EU contracts or pay carbon surcharges                                             |
| Consultants charge Rs 3-10 lakh/year for this      | Unaffordable for 90% of MSMEs                                                               |
| No India-localized tool exists                     | Global tools lack CEA state-wise grid factors or GST invoice formats                        |

**Our answer:** A simple calculator + report generator that costs a fraction of a consultant and takes 60 seconds.

---

## Architecture

Deliberately simple. One frontend. One backend. One database.

```
+----------------------------------+
|   Next.js Frontend (Vercel)      |
|  - Manual entry form             |
|  - File upload (OCR, Day 2)      |
|  - Dashboard with charts         |
|  - PDF download button           |
+----------------+-----------------+
                 | REST API (HTTPS)
+----------------v-----------------+
|   FastAPI Backend (Railway)      |
|  - /api/calculate  (core logic)  |
|  - /api/extract    (LLM + OCR)   |
|  - /api/report     (PDF gen)     |
+--------+--------------+----------+
         |              |
+--------v------+  +----v----------+
|  SQLite (dev) |  | Claude API    |
|  / Supabase   |  | (extraction)  |
|  (prod)       |  |               |
+---------------+  +---------------+
```

Key decision: SQLite for local dev, PostgreSQL (Supabase free tier) for production. No Redis. No queues. Everything is synchronous.

---

## Control Flow

### Path A — Manual Entry (Fastest to build, still impressive)

```
User fills form:
  kWh consumed:    12,400
  Diesel liters:   580
  State:           Tamil Nadu
  Tonnes produced: 200
  Industry:        Steel
        |
        v
POST /api/calculate
        |
        v
Emission Calculator:
  Scope 1 = 580  x 2.68  = 1,554.4 kg CO2e
  Scope 2 = 12400 x 0.82 = 10,168.0 kg CO2e
  Total   = 11,722.4 kg CO2e = 11.72 tCO2e
  Intensity = 11.72 / 200 = 0.0586 tCO2e/tonne
        |
        v
CBAM Readiness Check:
  EU benchmark for steel: 1.89 tCO2e/tonne
  Your intensity:         0.0586 tCO2e/tonne
  Status: PASS — 97% below benchmark
        |
        v
Return JSON -> Frontend renders dashboard
        |
        v
User clicks "Download Report"
POST /api/report -> returns CBAM-style PDF
```

### Path B — File Upload with OCR (More impressive demo)

```
User uploads electricity bill image or PDF
        |
        v
POST /api/extract { file, document_type: "electricity_bill" }
        |
        v
pytesseract -> raw text extracted from image
        |
        v
Claude API prompt:
  "Extract from this electricity bill:
   - Total units consumed in kWh
   - Billing month and year
   - State or DISCOM name
   Respond with JSON only, no explanation."
        |
        v
{ "kwh": 12400, "state": "Tamil Nadu", "month": "2024-01" }
        |
        v
Pre-fills the kWh field in the form automatically
User confirms values and submits
        |
        v
(same calculation path as Path A above)
```

---

## Tech Stack

### Frontend

| Technology      | Purpose                        |
| --------------- | ------------------------------ |
| Next.js 14      | React framework with SSR       |
| TypeScript      | Type safety                    |
| Tailwind CSS    | Utility-first styling          |
| shadcn/ui       | Prebuilt accessible components |
| Recharts        | Donut chart and bar chart      |
| React Hook Form | Form state management          |
| Axios           | API calls to backend           |

### Backend

| Technology           | Purpose                              |
| -------------------- | ------------------------------------ |
| Python 3.11          | Language                             |
| FastAPI              | Async REST API                       |
| SQLAlchemy           | ORM (SQLite + PostgreSQL compatible) |
| Pydantic v2          | Request/response validation          |
| ReportLab            | PDF generation                       |
| pytesseract          | OCR for bill images                  |
| PyMuPDF              | Convert PDF pages to images for OCR  |
| Anthropic Claude API | LLM structured data extraction       |
| python-multipart     | File upload handling                 |

### Hosting (All Free Tier)

| Service  | Use                                          |
| -------- | -------------------------------------------- |
| Vercel   | Frontend (Next.js)                           |
| Railway  | Backend (FastAPI)                            |
| Supabase | PostgreSQL (optional, SQLite works for demo) |

---

## File & Folder Structure

```
greenledger-lite/
|
+-- README.md
+-- .env.example
+-- .gitignore
|
+-- frontend/
|   +-- package.json
|   +-- next.config.js
|   +-- tailwind.config.ts
|   +-- tsconfig.json
|   |
|   +-- src/
|       +-- app/
|       |   +-- layout.tsx             # Root layout, fonts, metadata
|       |   +-- page.tsx               # Landing page with hero + CTA
|       |   +-- calculator/
|       |       +-- page.tsx           # Main calculator page
|       |
|       +-- components/
|       |   +-- Calculator/
|       |   |   +-- InputForm.tsx      # kWh + diesel + production form
|       |   |   +-- FileUpload.tsx     # Drag-drop upload, triggers auto-fill
|       |   |   +-- StateSelector.tsx  # Dropdown of all Indian states
|       |   |
|       |   +-- Dashboard/
|       |       +-- EmissionSummary.tsx  # Total tCO2e summary cards
|       |       +-- ScopeDonut.tsx       # Recharts pie: Scope 1 vs Scope 2
|       |       +-- IntensityCard.tsx    # Carbon intensity + benchmark bar
|       |       +-- CBAMBadge.tsx        # Green/yellow/red CBAM status
|       |       +-- DownloadButton.tsx   # Triggers PDF download
|       |
|       +-- lib/
|       |   +-- api.ts                 # Axios instance + typed API calls
|       |   +-- utils.ts               # cn() utility, number formatters
|       |
|       +-- types/
|           +-- emission.ts            # TypeScript interfaces
|
+-- backend/
    +-- requirements.txt
    +-- Procfile                       # Railway: web: uvicorn app.main:app ...
    |
    +-- app/
        +-- main.py                    # FastAPI app, CORS, route registration
        +-- config.py                  # Settings loaded from .env
        |
        +-- api/
        |   +-- calculate.py           # POST /api/calculate
        |   +-- extract.py             # POST /api/extract (OCR + LLM)
        |   +-- report.py              # POST /api/report (PDF)
        |
        +-- core/
        |   +-- emission_factors.py    # All hardcoded CEA + IPCC + CBAM values
        |   +-- calculator.py          # Scope 1 + 2 logic, intensity, CBAM check
        |   +-- cbam_checker.py        # Benchmark comparison and status label
        |   +-- pdf_generator.py       # ReportLab PDF builder
        |
        +-- services/
        |   +-- ocr_service.py         # pytesseract wrapper, PDF-to-image
        |   +-- llm_service.py         # Claude API prompt + JSON parsing
        |
        +-- models/
        |   +-- calculation.py         # SQLAlchemy model for calculations table
        |
        +-- schemas/
            +-- input.py               # Pydantic: CalculationInput
            +-- output.py              # Pydantic: CalculationResult
```

Total files to write from scratch: approximately 20. Realistic for 48 hours.

---

## Emission Calculation Engine

The entire core logic. Simple math with accurate India-specific data.

### emission_factors.py

```python
# India CEA Grid Emission Factors (2022-23, kg CO2 per kWh)
# Source: Central Electricity Authority CO2 Baseline Database v18
CEA_GRID_FACTORS = {
    "andhra_pradesh": 0.83,
    "gujarat":        0.88,
    "karnataka":      0.74,
    "maharashtra":    0.79,
    "rajasthan":      0.91,
    "tamil_nadu":     0.82,
    "telangana":      0.86,
    "west_bengal":    1.02,
    "punjab":         0.70,
    "haryana":        0.82,
    "national":       0.82,   # fallback if state unknown
}

# IPCC AR6 Combustion Factors (kg CO2e per unit)
COMBUSTION_FACTORS = {
    "diesel_per_liter":  2.68,
    "petrol_per_liter":  2.31,
    "lpg_per_kg":        2.98,
    "coal_per_kg":       2.42,
    "furnace_oil_liter": 3.17,
    "natural_gas_m3":    2.04,
}

# EU CBAM Industry Benchmarks (tCO2e per tonne of product)
CBAM_BENCHMARKS = {
    "steel":     1.89,
    "aluminium": 6.70,
    "cement":    0.81,
    "textile":   0.30,
    "chemicals": 1.20,
    "default":   1.50,
}
```

### calculator.py

```python
from .emission_factors import CEA_GRID_FACTORS, COMBUSTION_FACTORS, CBAM_BENCHMARKS

def calculate_scope1(diesel_liters: float = 0, lpg_kg: float = 0) -> float:
    """Direct combustion emissions in kg CO2e"""
    return (
        diesel_liters * COMBUSTION_FACTORS["diesel_per_liter"] +
        lpg_kg        * COMBUSTION_FACTORS["lpg_per_kg"]
    )

def calculate_scope2(kwh: float, state: str) -> float:
    """Purchased electricity emissions in kg CO2e"""
    key = state.lower().replace(" ", "_")
    factor = CEA_GRID_FACTORS.get(key, CEA_GRID_FACTORS["national"])
    return kwh * factor

def calculate_intensity(total_kg_co2e: float, production_tonnes: float) -> float:
    """Carbon intensity in tCO2e per tonne of product"""
    if production_tonnes <= 0:
        return 0
    return (total_kg_co2e / 1000) / production_tonnes

def check_cbam_readiness(intensity: float, industry: str) -> dict:
    benchmark = CBAM_BENCHMARKS.get(industry.lower(), CBAM_BENCHMARKS["default"])
    ratio = intensity / benchmark if benchmark > 0 else 0

    if ratio <= 0.8:
        status = "green"
        label  = "CBAM Ready — below EU benchmark"
    elif ratio <= 1.0:
        status = "yellow"
        label  = "Near EU benchmark — improvements needed"
    else:
        status = "red"
        label  = "Exceeds EU benchmark — CBAM tax applies"

    return {
        "status": status,
        "label": label,
        "your_intensity": round(intensity, 4),
        "eu_benchmark": benchmark,
        "percent_vs_benchmark": round((intensity / benchmark) * 100, 1),
    }

def run_full_calculation(
    kwh: float,
    state: str,
    diesel_liters: float,
    production_tonnes: float,
    industry: str,
    lpg_kg: float = 0,
) -> dict:
    scope1_kg  = calculate_scope1(diesel_liters, lpg_kg)
    scope2_kg  = calculate_scope2(kwh, state)
    total_kg   = scope1_kg + scope2_kg
    intensity  = calculate_intensity(total_kg, production_tonnes)
    cbam       = check_cbam_readiness(intensity, industry)

    return {
        "scope1_kg_co2e":  round(scope1_kg, 2),
        "scope2_kg_co2e":  round(scope2_kg, 2),
        "total_kg_co2e":   round(total_kg, 2),
        "total_tco2e":     round(total_kg / 1000, 4),
        "intensity":       round(intensity, 4),
        "cbam_status":     cbam,
    }
```

That is the complete intelligence of the app. About 55 lines of Python.

---

## Database Schema

SQLite for development. One table is enough for the hackathon.

```sql
CREATE TABLE calculations (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id          TEXT NOT NULL,
    company_name        TEXT,
    industry            TEXT,
    state               TEXT,
    kwh                 REAL,
    diesel_liters       REAL,
    lpg_kg              REAL DEFAULT 0,
    production_tonnes   REAL,
    scope1_kg_co2e      REAL,
    scope2_kg_co2e      REAL,
    total_tco2e         REAL,
    intensity           REAL,
    cbam_status         TEXT,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

No users table. No auth. No multi-tenancy. Session ID ties an upload to its result.

---

## API Reference

Three endpoints. That is the entire backend.

### POST /api/calculate

Request:

```json
{
  "company_name": "ABC Steel Works",
  "industry": "steel",
  "state": "tamil_nadu",
  "kwh": 12400,
  "diesel_liters": 580,
  "lpg_kg": 0,
  "production_tonnes": 200
}
```

Response:

```json
{
  "session_id": "uuid-here",
  "scope1_kg_co2e": 1554.4,
  "scope2_kg_co2e": 10168.0,
  "total_kg_co2e": 11722.4,
  "total_tco2e": 11.7224,
  "intensity": 0.0586,
  "cbam_status": {
    "status": "green",
    "label": "CBAM Ready — below EU benchmark",
    "your_intensity": 0.0586,
    "eu_benchmark": 1.89,
    "percent_vs_benchmark": 3.1
  }
}
```

---

### POST /api/extract

Request: `multipart/form-data`

- `file`: PDF or image of bill
- `document_type`: `"electricity_bill"` or `"diesel_invoice"`

Response:

```json
{
  "document_type": "electricity_bill",
  "extracted": {
    "kwh": 12400,
    "state": "Tamil Nadu",
    "month": "2024-01"
  },
  "confidence": "high"
}
```

---

### POST /api/report

Request:

```json
{ "session_id": "uuid-here" }
```

Response: `application/pdf` binary — triggers file download in browser.

---

## Frontend Pages & Components

### Page 1 — Landing (`/`)

- Headline: "CBAM Carbon Report in 60 Seconds"
- Three key points: what it does, who it helps, why it matters
- Single CTA button: "Start Calculating"
- No login wall

### Page 2 — Calculator (`/calculator`)

Left panel (inputs):

```
Company Name         [________________]
Industry             [Steel          v]
State                [Tamil Nadu     v]

Electricity
Units consumed (kWh) [________________]
[Upload Bill — auto-fill kWh]

Diesel
Liters purchased     [________________]
[Upload Invoice — auto-fill liters]

Production
Tonnes produced      [________________]

[  Calculate Emissions  ]
```

Right panel (results, shown after calculation):

```
Total: 11.72 tCO2e    Scope 1: 1.55    Scope 2: 10.17

[Donut chart: Scope 1 vs Scope 2]

Carbon Intensity: 0.0586 tCO2e / tonne
EU Benchmark:     1.89   tCO2e / tonne

+-----------------------------+
| CBAM Ready                  |
| Your intensity is 97% below |
| the EU steel benchmark.     |
+-----------------------------+

[  Download CBAM Report PDF  ]
```

### Key Component Notes

**FileUpload.tsx** — On file drop, calls POST /api/extract, shows loading spinner, then auto-fills the relevant numeric field. Displays "Auto-filled from bill" confirmation label.

**ScopeDonut.tsx** — Recharts PieChart, two segments. Scope 1 in orange, Scope 2 in blue. Animated on render. Legend below chart.

**CBAMBadge.tsx** — Full-width colored card. Green/yellow/red background. Shows your number vs EU benchmark and the percentage difference.

**DownloadButton.tsx** — Calls POST /api/report, receives PDF blob, triggers browser download via URL.createObjectURL.

---

## Environment Variables

```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=sqlite:///./greenledger.db
ENVIRONMENT=development

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Only three variables needed to run locally. No cloud credentials required for the demo.

---

## Installation & Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Anthropic API key (only needed if testing OCR extraction)
- Tesseract OCR (only needed if testing OCR extraction)

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env
echo "ANTHROPIC_API_KEY=your_key_here" > .env
echo "DATABASE_URL=sqlite:///./greenledger.db" >> .env

uvicorn app.main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
.\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000
# echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
# npm run dev
# App: http://localhost:3000
```

### Install Tesseract (for OCR feature)

```bash
# Ubuntu / WSL
sudo apt install tesseract-ocr

# macOS
brew install tesseract

# Windows — installer at https://github.com/UB-Mannheim/tesseract/wiki
```

### requirements.txt

```
fastapi==0.111.0
uvicorn[standard]==0.30.1
sqlalchemy==2.0.30
pydantic[email]==2.7.1
pydantic-settings==2.3.0
python-multipart==0.0.9
anthropic==0.28.0
reportlab==4.2.0
pytesseract==0.3.10
Pillow==10.3.0
PyMuPDF==1.24.5
```

---

## Deployment

### Frontend → Vercel (2 minutes)

```bash
cd frontend
npx vercel deploy --prod
# Set NEXT_PUBLIC_API_URL in Vercel dashboard to Railway URL
```

### Backend → Railway (5 minutes)

1. Push code to GitHub
2. railway.app → New Project → Deploy from GitHub repo
3. Set root directory to `backend/`
4. Add environment variables in Railway dashboard
5. Railway reads `Procfile` and deploys automatically

**Procfile:**

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Total deployment time: under 10 minutes.

---

## 48-Hour Build Plan

### Day 1 Morning — Core Logic (4 hours)

- Set up FastAPI project skeleton
- Write emission_factors.py with all hardcoded values
- Write calculator.py with Scope 1, Scope 2, intensity, CBAM check
- Wire up POST /api/calculate
- Test in Swagger UI with sample numbers
- Set up SQLite model and session

### Day 1 Afternoon — Frontend Base (4 hours)

- Set up Next.js project with Tailwind + shadcn
- Build InputForm.tsx with all fields
- Connect to POST /api/calculate
- Build EmissionSummary cards showing numbers
- Build ScopeDonut chart with Recharts
- Build CBAMBadge component

### Day 1 Evening — PDF + Full Flow (2 hours)

- Write pdf_generator.py using ReportLab
- Wire up POST /api/report endpoint
- Build DownloadButton component
- Add basic form validation
- Do an end-to-end test: enter data, calculate, download PDF

### Day 2 Morning — OCR Feature (3 hours)

- Write ocr_service.py using pytesseract
- Write llm_service.py with Claude extraction prompt
- Wire up POST /api/extract
- Build FileUpload.tsx with auto-fill behaviour
- Test with a real sample electricity bill

### Day 2 Afternoon — Polish + Deploy (3 hours)

- Add benchmark comparison visual
- Build landing page
- Add loading spinners and error states
- Mobile responsive pass
- Deploy to Vercel and Railway
- Run full demo rehearsal twice

### What to cut if running behind

- OCR upload feature — replace with manual entry only (still demonstrates core value)
- PDF visual polish — plain text PDF is fine if the data is correct
- Benchmark bar chart — show as a text comparison instead
- Landing page — go straight to the calculator

---

## Pitch Strategy

### What to say

"Indian MSMEs exporting steel, cement, and aluminium to the EU now face the CBAM carbon border tax. The problem: they have no way to calculate their embedded carbon. Consultants charge Rs 3-10 lakh a year. We built GreenLedger Lite. Upload your electricity bill and diesel invoice. In 60 seconds you get your Scope 1 and Scope 2 emissions, your carbon intensity compared to the EU benchmark, and a CBAM-ready PDF report. Scope 3 and multi-regulation support is Phase 2."

### What not to say

- Do not mention microservices, knowledge graphs, or async queues
- Do not say "we are building a full ESG platform"
- Do not apologize for missing features — emphasize what works

### Demo script

1. Open the calculator page
2. Drop a real electricity bill into the upload zone — watch the kWh auto-fill
3. Enter diesel liters manually: 580
4. Enter production: 200 tonnes, industry: steel
5. Hit Calculate — show dashboard with donut chart
6. Hit Download — open the PDF
7. Say: "This took 45 seconds. The consultant quoted Rs 4 lakh."

---

## Roadmap Post-Hackathon

This build proves the core value proposition. After validation:

**Phase 2 — Product (Month 1-3)**

- User authentication (Supabase Auth)
- Multi-month tracking and trend charts
- BRSR compliance checklist
- Scope 3 transport emissions (freight invoices)

**Phase 3 — Scale (Month 4-6)**

- Supplier portal for Scope 3 data
- CBAM XML export format
- GST invoice parser
- Regional language support (Tamil, Gujarati, Marathi)

**Phase 4 — Moat (Month 7-12)**

- Carbon credit eligibility assessment
- Green financing readiness report
- White-label version for sustainability consultants
- API for ERP integrations (Tally, Busy)

---

## Disclaimer

Emission calculations use standard factors from CEA 2022-23, IPCC AR6, and GHG Protocol. All reports are AI-assisted drafts. Verify with a qualified sustainability professional before official CBAM submission.

---

_Built in 48 hours. Solves a Rs 10,000 crore compliance gap._
# BharatZero
