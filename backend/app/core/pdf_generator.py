from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
from typing import Any


# Brand colours
GREEN  = colors.HexColor("#16a34a")
YELLOW = colors.HexColor("#ca8a04")
RED    = colors.HexColor("#dc2626")
DARK   = colors.HexColor("#111827")
GRAY   = colors.HexColor("#6b7280")
LIGHT  = colors.HexColor("#f3f4f6")
WHITE  = colors.white


def _status_color(status: str):
    return {"green": GREEN, "yellow": YELLOW, "red": RED}.get(status, GRAY)


def generate_report_pdf(calc: Any, cbam_status: dict) -> bytes:
    """Build a CBAM-compliance PDF report and return raw bytes."""
    from io import BytesIO
    buf = BytesIO()

    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    story  = []

    # ── Header ────────────────────────────────────────────────────────────────
    header_style = ParagraphStyle(
        "header",
        parent=styles["Normal"],
        fontSize=22,
        textColor=WHITE,
        fontName="Helvetica-Bold",
        spaceAfter=4,
    )
    sub_style = ParagraphStyle(
        "sub",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#d1fae5"),
        fontName="Helvetica",
    )

    header_table = Table(
        [[
            Paragraph("GreenLedger Lite", header_style),
            Paragraph("CBAM Carbon Emissions Report", sub_style),
        ]],
        colWidths=["55%", "45%"],
    )
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), GREEN),
        ("TOPPADDING",    (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
        ("LEFTPADDING",   (0, 0), (-1, -1), 14),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 0.5 * cm))

    # ── Report metadata ───────────────────────────────────────────────────────
    meta_style = ParagraphStyle("meta", parent=styles["Normal"], fontSize=9, textColor=GRAY)
    story.append(Paragraph(
        f"Report generated: {datetime.utcnow().strftime('%d %B %Y, %H:%M UTC')} &nbsp;&nbsp;|&nbsp;&nbsp; "
        f"Session ID: {calc.session_id}",
        meta_style,
    ))
    story.append(Spacer(1, 0.3 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT))
    story.append(Spacer(1, 0.4 * cm))

    # ── Company info ──────────────────────────────────────────────────────────
    section_title = ParagraphStyle(
        "sec", parent=styles["Normal"], fontSize=12,
        fontName="Helvetica-Bold", textColor=DARK, spaceBefore=8, spaceAfter=4,
    )
    story.append(Paragraph("Company Information", section_title))

    company_data = [
        ["Company Name", calc.company_name or "—"],
        ["Industry",     (calc.industry or "—").title()],
        ["State",        (calc.state or "—").replace("_", " ").title()],
        ["Report Period", datetime.utcnow().strftime("%B %Y")],
    ]
    company_table = Table(company_data, colWidths=["40%", "60%"])
    company_table.setStyle(TableStyle([
        ("FONTNAME",  (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",  (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), DARK),
        ("TEXTCOLOR", (1, 0), (1, -1), GRAY),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, LIGHT]),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
    ]))
    story.append(company_table)
    story.append(Spacer(1, 0.5 * cm))

    # ── Emission inputs ───────────────────────────────────────────────────────
    story.append(Paragraph("Activity Data (Inputs)", section_title))
    input_data = [
        ["Parameter",                "Value",          "Unit"],
        ["Electricity Consumed",     f"{calc.kwh:,.1f}",          "kWh"],
        ["Diesel Consumed",          f"{calc.diesel_liters:,.1f}", "Litres"],
        ["LPG Consumed",             f"{calc.lpg_kg:,.1f}",        "kg"],
        ["Production Quantity",      f"{calc.production_tonnes:,.1f}", "Tonnes"],
    ]
    input_table = Table(input_data, colWidths=["45%", "30%", "25%"])
    input_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), DARK),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT]),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("ALIGN",         (1, 0), (-1, -1), "RIGHT"),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
    ]))
    story.append(input_table)
    story.append(Spacer(1, 0.5 * cm))

    # ── Emissions results ─────────────────────────────────────────────────────
    story.append(Paragraph("Carbon Emission Results", section_title))
    results_data = [
        ["Emission Category",  "kg CO₂e",                         "tCO₂e"],
        ["Scope 1 (Direct Combustion)", f"{calc.scope1_kg_co2e:,.2f}", f"{calc.scope1_kg_co2e/1000:.4f}"],
        ["Scope 2 (Purchased Electricity)", f"{calc.scope2_kg_co2e:,.2f}", f"{calc.scope2_kg_co2e/1000:.4f}"],
        ["TOTAL",              f"{(calc.scope1_kg_co2e + calc.scope2_kg_co2e):,.2f}", f"{calc.total_tco2e:.4f}"],
    ]
    results_table = Table(results_data, colWidths=["50%", "25%", "25%"])
    results_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), DARK),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME",      (0, -1), (-1, -1), "Helvetica-Bold"),
        ("BACKGROUND",    (0, -1), (-1, -1), colors.HexColor("#dcfce7")),
        ("TEXTCOLOR",     (0, -1), (-1, -1), colors.HexColor("#14532d")),
        ("FONTSIZE",      (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [WHITE, LIGHT]),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("ALIGN",         (1, 0), (-1, -1), "RIGHT"),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
    ]))
    story.append(results_table)
    story.append(Spacer(1, 0.5 * cm))

    # ── CBAM status ───────────────────────────────────────────────────────────
    story.append(Paragraph("CBAM Compliance Assessment", section_title))

    status      = cbam_status.get("status", "green")
    label       = cbam_status.get("label", "")
    your_int    = cbam_status.get("your_intensity", calc.intensity)
    eu_bench    = cbam_status.get("eu_benchmark", 0)
    pct         = cbam_status.get("percent_vs_benchmark", 0)
    badge_color = _status_color(status)

    cbam_data = [
        ["Carbon Intensity (your facility)",   f"{your_int:.4f} tCO₂e/tonne"],
        ["EU CBAM Benchmark",                  f"{eu_bench:.2f} tCO₂e/tonne"],
        ["Your intensity vs benchmark",        f"{pct:.1f}%"],
        ["CBAM Status",                        label],
    ]
    cbam_table = Table(cbam_data, colWidths=["55%", "45%"])
    cbam_table.setStyle(TableStyle([
        ("FONTNAME",  (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",  (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), DARK),
        ("TEXTCOLOR", (1, 0), (1, -2), GRAY),
        ("BACKGROUND", (0, -1), (-1, -1), badge_color),
        ("TEXTCOLOR",  (0, -1), (-1, -1), WHITE),
        ("FONTNAME",   (0, -1), (-1, -1), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -2), [WHITE, LIGHT]),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
    ]))
    story.append(cbam_table)
    story.append(Spacer(1, 0.8 * cm))

    # ── Methodology note ──────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT))
    story.append(Spacer(1, 0.3 * cm))
    disclaimer_style = ParagraphStyle(
        "disc", parent=styles["Normal"], fontSize=8, textColor=GRAY, leading=12,
    )
    story.append(Paragraph(
        "<b>Methodology:</b> Scope 1 emissions calculated using IPCC AR6 combustion factors. "
        "Scope 2 emissions calculated using CEA Grid Emission Factors v18 (2022-23). "
        "CBAM benchmarks sourced from EU Regulation 2023/956. "
        "All calculations follow GHG Protocol Corporate Standard.",
        disclaimer_style,
    ))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph(
        "<b>Disclaimer:</b> This report is AI-assisted and intended for preliminary assessment only. "
        "Verify with a qualified sustainability professional before official CBAM submission.",
        disclaimer_style,
    ))

    doc.build(story)
    return buf.getvalue()
