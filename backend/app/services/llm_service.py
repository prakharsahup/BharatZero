import json
import base64
import io
import re

import google.generativeai as genai
from PIL import Image

from app.config import settings


def _is_quota_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    return "429" in str(exc) or "quota" in msg or "resource_exhausted" in msg or "rate" in msg



ELECTRICITY_INSTRUCTION = (
    'Extract from this electricity bill:\n'
    '- Total units consumed in kWh (look for "units", "kWh", "UNITS CONSUMED", "Net Units")\n'
    '- Billing month and year\n'
    '- State or DISCOM name\n\n'
    'Respond with JSON only, no explanation:\n'
    '{"kwh": <number>, "state": "<state name>", "month": "<YYYY-MM>"}'
)

DIESEL_INSTRUCTION = (
    'Extract from this diesel invoice:\n'
    '- Total diesel quantity in liters (look for "Qty", "Quantity", "Litres", "KL")\n'
    '- Invoice date\n\n'
    'Respond with JSON only, no explanation:\n'
    '{"liters": <number>, "date": "<YYYY-MM-DD>"}'
)


class QuotaExceededError(Exception):
    """Raised when the Gemini API quota is exhausted and all retries failed."""


# ── Condensed CBAM constraint context fed to Gemini ───────────────────────────
_CBAM_CONSTRAINTS = """\
CBAM REGULATORY CONSTRAINTS SUMMARY (EU Regulation 2023/956)

LEGAL: Only Annex I goods (steel, aluminium, cement, fertilisers, electricity, hydrogen) are covered.
Only authorised CBAM Declarants may import. Quarterly reporting in transitional phase; annual
declaration from 2026. Penalties per tonne of unreported emissions; suspension of authorisation possible.

EMISSIONS ACCOUNTING: Must report Scope 1 (direct combustion) + Scope 2 (purchased electricity) +
precursor embedded emissions. EU-approved calculation methods and system boundaries are mandatory.
Default values apply if actual data is unavailable, but defaults are conservative (higher) and their
use is restricted over time. Plant-level AND product-level granularity required — country averages
not accepted long-term. Renewable electricity claims require documented PPAs or GO certificates.

FINANCIAL: CBAM certificates priced at EU ETS weekly average (volatile). Only officially recognised
domestic carbon-pricing schemes are deductible — voluntary offsets are NOT accepted. Certificates
purchased in advance; annual surrender required. ETS price spikes create cash-flow risk.

OPERATIONAL: Upstream precursor emissions may be required (e.g. iron ore → steel). Multiple plants
must report separately — no facility averaging unless explicitly permitted. Record retention mandatory
for several years with full audit trail. Monitoring infrastructure (metering, energy tracking) needed.

VERIFICATION (from 2026): Mandatory third-party verification by an EU-accredited verifier following
EU MRV methodology. Insufficient methodology risks report rejection and default-value imposition.

PHASE TRANSITION:
- Transitional 2023-2025: No certificate purchase; limited verification; more default values allowed.
- Definitive 2026+: Certificate purchase required; mandatory verification; restricted defaults;
  strict enforcement and penalties fully active.

STRATEGIC RISKS: CBAM scope expected to expand to polymers, chemicals, more downstream goods.
High embedded-emission producers face competitive disadvantage vs cleaner EU/third-country producers.
"""


def _safe_str(val, default="—") -> str:
    return str(val).replace("_", " ").title() if val is not None else default


def _safe_num(val, default=0):
    return val if val is not None else default


def _rule_based_compliance(calc_data: dict, cbam: dict) -> dict:
    """
    Deterministic compliance note when Gemini is unavailable.
    Derived entirely from the numeric calculation data.
    """
    pct        = _safe_num(cbam.get("percent_vs_benchmark"))   # % of EU benchmark
    intensity  = _safe_num(calc_data.get("intensity"))
    eu_bench   = _safe_num(cbam.get("eu_benchmark"))
    industry   = _safe_str(calc_data.get("industry"))
    scope1     = _safe_num(calc_data.get("scope1_kg_co2e"))
    scope2     = _safe_num(calc_data.get("scope2_kg_co2e"))
    total_e    = scope1 + scope2
    kwh        = _safe_num(calc_data.get("kwh"))
    diesel     = _safe_num(calc_data.get("diesel_liters"))

    # Risk tier ────────────────────────────────────────────────────────────────
    if pct <= 80:
        risk_level = "low"
    elif pct <= 110:
        risk_level = "medium"
    else:
        risk_level = "high"

    # Summary ──────────────────────────────────────────────────────────────────
    if risk_level == "low":
        summary = (
            f"Your {industry} facility is performing well against CBAM requirements, with a carbon "
            f"intensity {100 - pct:.1f}% below the EU benchmark. This positions you favourably for "
            f"EU export markets. Maintaining current emission levels and building a robust "
            f"documentation trail are the key priorities before the definitive phase in 2026."
        )
    elif risk_level == "medium":
        summary = (
            f"Your {industry} facility sits close to the EU CBAM benchmark at {pct:.1f}% of the "
            f"threshold, indicating a moderate compliance risk. Small increases in energy use or "
            f"production mix changes could push you into non-compliant territory. Targeted "
            f"reductions and early verification preparation are recommended now."
        )
    else:
        summary = (
            f"Your {industry} facility's carbon intensity exceeds the EU CBAM benchmark by "
            f"{pct - 100:.1f}%, representing a significant compliance and financial risk. "
            f"Certificate purchases at current EU ETS prices will add material costs to every "
            f"tonne exported. Immediate decarbonisation and data accuracy improvements are critical."
        )

    # Key risks ────────────────────────────────────────────────────────────────
    key_risks = []

    key_risks.append({
        "area": "Verification Readiness (2026)",
        "detail": (
            f"From 2026, {industry} emissions must be independently verified by an EU-accredited "
            f"verifier — self-reported data will not be accepted for certificate surrender."
        ),
    })

    if kwh > 0 and total_e > 0 and scope2 / total_e > 0.3:
        key_risks.append({
            "area": "Scope 2 Electricity Share",
            "detail": (
                f"Electricity accounts for {scope2 / total_e * 100:.0f}% of total emissions. "
                f"Renewable energy procurement (solar PPA or open-access) or GO certificates "
                f"could significantly reduce your carbon intensity."
            ),
        })

    if diesel > 0:
        key_risks.append({
            "area": "Scope 1 Combustion (Diesel)",
            "detail": (
                "Diesel combustion generates direct Scope 1 emissions fully subject to CBAM; "
                "fuel efficiency measures or electrification would provide a direct intensity benefit."
            ),
        })

    if risk_level in ("medium", "high"):
        key_risks.append({
            "area": "CBAM Certificate Cost",
            "detail": (
                f"At {intensity:.4f} tCO\u2082e/tonne vs EU benchmark {eu_bench:.2f}, "
                f"certificate costs at ~\u20ac60\u201380/tCO\u2082e could materially compress export margins."
            ),
        })
    else:
        key_risks.append({
            "area": "Data Granularity Requirement",
            "detail": (
                "CBAM requires plant-level and product-level emission data; country or sector "
                "averages will be disallowed from 2026 — invest in metering infrastructure now."
            ),
        })

    # Recommendations ──────────────────────────────────────────────────────────
    recommendations = []

    if risk_level == "high":
        recommendations.append(
            f"Commission an energy audit for your {industry} facility to identify the "
            f"highest-impact emission reduction opportunities before the 2026 definitive phase."
        )

    if kwh > 5000:
        recommendations.append(
            "Explore renewable energy procurement (rooftop solar, open-access wind, or PPA) "
            "to reduce your Scope 2 grid emission factor and lower overall carbon intensity."
        )

    recommendations.append(
        "Install plant-level energy meters and establish monthly emission tracking now "
        "to build the three-year audit trail required for CBAM verification."
    )

    if risk_level in ("medium", "high"):
        recommendations.append(
            "Engage your EU importers to confirm CBAM Declarant registration and agree on "
            "data-sharing protocols before the annual declaration deadline."
        )

    recommendations.append(
        "Retain all energy bills, production records, and emission calculations for "
        "at least five years to satisfy CBAM record-retention and audit requirements."
    )

    # Phase note ───────────────────────────────────────────────────────────────
    if risk_level == "low":
        phase_note = (
            "From 2026 you will need to purchase CBAM certificates and undergo mandatory "
            "third-party verification, but your low intensity means certificate costs "
            "should remain modest relative to your export revenue."
        )
    elif risk_level == "medium":
        phase_note = (
            "When the definitive phase begins in 2026, mandatory certificate purchase and "
            "compulsory verification will apply; your borderline intensity means even a "
            "moderate ETS price rise could significantly raise per-tonne export costs."
        )
    else:
        phase_note = (
            "The 2026 definitive phase brings mandatory certificate purchase at full EU ETS "
            "prices plus third-party verification — at your current intensity this represents "
            "a substantial recurring cost that demands urgent decarbonisation action."
        )

    return {
        "summary":         summary,
        "risk_level":      risk_level,
        "key_risks":       key_risks[:4],
        "recommendations": recommendations[:4],
        "phase_note":      phase_note,
    }


def _extract_json(text: str) -> dict:
    """Robustly extract the first JSON object from a Gemini response."""
    text = text.strip()
    # Strip markdown code fences (```json ... ``` or ``` ... ```)
    text = re.sub(r"^```[a-z]*\n?", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\n?```$", "", text.strip())
    text = text.strip()
    # If still not starting with {, find the first { ... } block
    if not text.startswith("{"):
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            text = match.group(0)
    return json.loads(text)


def analyze_compliance(calc_data: dict) -> dict:
    """
    Send calculation data + CBAM constraints to Gemini and return a structured
    compliance note as a Python dict.
    """
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    # Safely parse cbam_status regardless of whether it's a str, dict, or None
    cbam_raw = calc_data.get("cbam_status") or {}
    if isinstance(cbam_raw, str):
        try:
            cbam: dict = json.loads(cbam_raw)
        except Exception:
            cbam = {}
    elif isinstance(cbam_raw, dict):
        cbam = cbam_raw
    else:
        cbam = {}

    prompt = f"""\
You are an expert EU CBAM (Carbon Border Adjustment Mechanism) compliance consultant
advising an Indian exporter. Analyse the company's emissions data against the CBAM
constraints below and produce a concise, actionable compliance note.

=== COMPANY DATA ===
Company      : {calc_data.get('company_name') or 'Not provided'}
Industry     : {_safe_str(calc_data.get('industry'))}
State (India): {_safe_str(calc_data.get('state'))}
Electricity  : {_safe_num(calc_data.get('kwh')):,.0f} kWh
Diesel       : {_safe_num(calc_data.get('diesel_liters')):,.0f} litres
LPG          : {_safe_num(calc_data.get('lpg_kg')):,.0f} kg
Production   : {_safe_num(calc_data.get('production_tonnes')):,.0f} tonnes
Scope 1      : {_safe_num(calc_data.get('scope1_kg_co2e')):,.2f} kg CO2e
Scope 2      : {_safe_num(calc_data.get('scope2_kg_co2e')):,.2f} kg CO2e
Total        : {_safe_num(calc_data.get('total_tco2e')):.4f} tCO2e
Intensity    : {_safe_num(calc_data.get('intensity')):.4f} tCO2e/tonne
EU Benchmark : {_safe_num(cbam.get('eu_benchmark')):.2f} tCO2e/tonne
vs Benchmark : {_safe_num(cbam.get('percent_vs_benchmark')):.1f}%
CBAM Status  : {cbam.get('label') or cbam.get('status') or 'Unknown'}

=== CBAM CONSTRAINTS ===
{_CBAM_CONSTRAINTS}

=== INSTRUCTIONS ===
Return ONLY a raw JSON object — absolutely no markdown, no code fences, no extra text.
Start your response with {{ and end with }}.
Use this exact structure:
{{
  "summary": "2-3 sentences covering overall compliance posture and the most important implication",
  "risk_level": "low or medium or high",
  "key_risks": [
    {{"area": "short risk category", "detail": "one concise sentence specific to this company"}},
    {{"area": "...", "detail": "..."}}
  ],
  "recommendations": [
    "specific actionable step for this company",
    "..."
  ],
  "phase_note": "one sentence about what changes for this company when the definitive phase starts in 2026"
}}
Limit key_risks to the 4 most relevant for this specific company and industry.
Limit recommendations to the 4 highest-priority actions.
"""

    # No retries for compliance — fail fast; fall back to rule-based on quota error
    try:
        response = model.generate_content(prompt)
        return _extract_json(response.text)
    except Exception as exc:
        if _is_quota_error(exc):
            print("Gemini quota hit for compliance — using rule-based fallback.")
            return _rule_based_compliance(calc_data, cbam)
        raise


def extract_bill_data(content: dict, document_type: str) -> dict:
    """
    Use Gemini to extract structured data from a bill.

    `content` is the dict returned by ocr_service.extract_content():
      {"type": "text",  "content": "..."}
    or
      {"type": "image", "content": "<b64>", "media_type": "image/png"}
    """
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    instruction = (
        ELECTRICITY_INSTRUCTION
        if document_type == "electricity_bill"
        else DIESEL_INSTRUCTION
    )

    def _build_parts():
        if content["type"] == "text":
            return f"{instruction}\n\nBill text:\n{content['content'][:4000]}"
        img_bytes = base64.b64decode(content["content"])
        img = Image.open(io.BytesIO(img_bytes))
        return [instruction, img]

    # Fail fast on quota errors so the UI gets a response within the request timeout
    try:
        response = model.generate_content(_build_parts())
    except Exception as exc:
        if _is_quota_error(exc):
            raise QuotaExceededError(str(exc)) from exc
        raise

    response_text = response.text.strip()

    # Strip markdown code fences if Gemini wraps the JSON
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(l for l in lines if not l.startswith("```")).strip()

    return json.loads(response_text)
