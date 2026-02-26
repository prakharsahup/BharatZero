import json
import anthropic
from app.config import settings


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


def extract_bill_data(content: dict, document_type: str) -> dict:
    """
    Use Claude to extract structured data from a bill.

    `content` is the dict returned by ocr_service.extract_content():
      {"type": "text",  "content": "..."}
    or
      {"type": "image", "content": "<b64>", "media_type": "image/png"}
    """
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    instruction = (
        ELECTRICITY_INSTRUCTION
        if document_type == "electricity_bill"
        else DIESEL_INSTRUCTION
    )

    if content["type"] == "text":
        # Plain-text prompt — cheaper and fast
        messages = [
            {
                "role": "user",
                "content": f"{instruction}\n\nBill text:\n{content['content'][:4000]}",
            }
        ]
    else:
        # Vision prompt — send the bill image directly to Claude
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": content["media_type"],
                            "data": content["content"],
                        },
                    },
                    {"type": "text", "text": instruction},
                ],
            }
        ]

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=messages,
    )

    response_text = message.content[0].text.strip()

    # Strip markdown code fences if Claude wraps the JSON
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(l for l in lines if not l.startswith("```")).strip()

    return json.loads(response_text)
