import json
import anthropic
from app.config import settings


ELECTRICITY_PROMPT = """Extract from this electricity bill text:
- Total units consumed in kWh (look for "units", "kWh", "UNITS CONSUMED", "Net Units")
- Billing month and year
- State or DISCOM name

Electricity bill text:
{raw_text}

Respond with JSON only, no explanation:
{{"kwh": <number>, "state": "<state name>", "month": "<YYYY-MM>"}}"""

DIESEL_PROMPT = """Extract from this diesel invoice text:
- Total diesel quantity in liters (look for "Qty", "Quantity", "Litres", "KL")
- Invoice date

Diesel invoice text:
{raw_text}

Respond with JSON only, no explanation:
{{"liters": <number>, "date": "<YYYY-MM-DD>"}}"""


def extract_bill_data(raw_text: str, document_type: str) -> dict:
    """Use Claude claude-sonnet-4-6 to extract structured data from OCR'd bill text."""
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    if document_type == "electricity_bill":
        prompt = ELECTRICITY_PROMPT.format(raw_text=raw_text[:4000])
    else:
        prompt = DIESEL_PROMPT.format(raw_text=raw_text[:4000])

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = message.content[0].text.strip()

    # Strip markdown code fences if Claude wraps JSON in them
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        # Remove first and last fence lines
        inner = [l for l in lines if not l.startswith("```")]
        response_text = "\n".join(inner).strip()

    return json.loads(response_text)
