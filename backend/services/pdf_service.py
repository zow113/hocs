"""PDF generation service for HOCS reports"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics import renderPDF
from io import BytesIO
from datetime import datetime
from typing import List
from models import Session, SavingsOpportunity


class TierGroup:
    """Represents a tier group with opportunities"""
    def __init__(self, tier: int, title: str, description: str, opportunities: List[SavingsOpportunity], color: str):
        self.tier = tier
        self.title = title
        self.description = description
        self.opportunities = opportunities
        self.color = color


def organize_opportunities_into_tiers(opportunities: List[SavingsOpportunity]) -> List[TierGroup]:
    """
    Organize opportunities into 5 tiers based on the logic from Plan.tsx (lines 36-77)
    """
    tier1: List[SavingsOpportunity] = []  # Instant visibility (free tracking)
    tier2: List[SavingsOpportunity] = []  # Free diagnostics and assistance
    tier3: List[SavingsOpportunity] = []  # Low-cost behavior changes
    tier4: List[SavingsOpportunity] = []  # Medium-cost upgrades
    tier5: List[SavingsOpportunity] = []  # Major projects

    for opp in opportunities:
        # Tier 2: Free programs and audits
        if opp.upfrontCost.max == 0 and (
            'audit' in opp.name.lower() or
            'weatherization' in opp.name.lower() or
            'assistance' in opp.name.lower()
        ):
            tier2.append(opp)
        # Tier 3: Free or very low cost behavior changes
        elif opp.upfrontCost.max <= 200 and (
            'water conservation kit' in opp.name.lower() or
            'led' in opp.name.lower() or
            'power strip' in opp.name.lower()
        ):
            tier3.append(opp)
        # Tier 4: Low to medium cost upgrades
        elif opp.upfrontCost.max > 200 and opp.upfrontCost.max <= 3000:
            tier4.append(opp)
        # Tier 5: Major investments
        elif opp.upfrontCost.max > 3000:
            tier5.append(opp)
        # Default: put remaining free items in tier 2
        elif opp.upfrontCost.max == 0:
            tier2.append(opp)
        # Everything else goes to tier 4
        else:
            tier4.append(opp)

    return [
        TierGroup(
            tier=1,
            title='Instant Visibility (Near-Zero Cost)',
            description='Set up tracking and establish your baseline. You can\'t manage what you don\'t measure.',
            opportunities=tier1,
            color='green'
        ),
        TierGroup(
            tier=2,
            title='Free In-Home Checks & Diagnostics',
            description='Get professional assessments and qualify for free upgrades at no cost.',
            opportunities=tier2,
            color='blue'
        ),
        TierGroup(
            tier=3,
            title='Data-Driven Behavior & Low-Cost Controls',
            description='Use your baseline data to make smart, low-cost changes with immediate impact.',
            opportunities=tier3,
            color='yellow'
        ),
        TierGroup(
            tier=4,
            title='Targeted Low/Medium-Cost Upgrades',
            description='Invest in upgrades that your data shows will have the best ROI.',
            opportunities=tier4,
            color='orange'
        ),
        TierGroup(
            tier=5,
            title='Major Projects Informed by Data',
            description='After 3-6 months of tracking, consider major investments with proven payback.',
            opportunities=tier5,
            color='purple'
        )
    ]


def format_currency(value: float) -> str:
    """Format currency values"""
    return f"${value:,.0f}"


def generate_report_pdf(session_data: Session) -> bytes:
    """
    Generate a PDF report for a session with property data and opportunities.
    Implements the 5-tier action plan structure from Plan.tsx.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=10,
        spaceBefore=10
    )
    
    tier_title_style = ParagraphStyle(
        'TierTitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=6,
        spaceBefore=12,
        leftIndent=0
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#374151'),
        spaceAfter=6
    )
    
    small_style = ParagraphStyle(
        'SmallText',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#6b7280'),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#4b5563'),
        alignment=TA_CENTER,
        spaceAfter=8
    )
    
    # Cover Page
    elements.append(Spacer(1, 1.5*inch))
    elements.append(Paragraph("HOCS", title_style))
    elements.append(Paragraph("Home Ownership Cost Savings", subtitle_style))
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph("Your Visibility-First Action Plan", heading_style))
    elements.append(Spacer(1, 0.2*inch))
    elements.append(Paragraph(f"<b>Property:</b> {session_data.property_data.address}", body_style))
    elements.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%B %d, %Y')}", body_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Total potential savings
    total_savings = sum(opp.annualSavings for opp in session_data.opportunities)
    savings_text = f"<b>Total Potential Annual Savings: {format_currency(total_savings)}</b>"
    elements.append(Paragraph(savings_text, heading_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Introduction
    intro_text = """
    Follow this crawl-walk-run approach: Start with Tier 1 to establish visibility, 
    then work through each tier sequentially. Complete one tier before moving to the next.
    """
    elements.append(Paragraph(intro_text, body_style))
    
    elements.append(PageBreak())
    
    # Property Insights Summary
    elements.append(Paragraph("Property Insights", heading_style))
    elements.append(Spacer(1, 0.1*inch))
    
    property_data = [
        ['Year Built', str(session_data.property_data.yearBuilt)],
        ['Square Feet', f"{session_data.property_data.squareFeet:,}"],
        ['Bedrooms/Bathrooms', f"{session_data.property_data.bedrooms}/{session_data.property_data.bathrooms}"],
        ['Utility Provider', session_data.property_data.utilityProvider],
        ['Wildfire Zone', session_data.property_data.wildfireZone],
        ['Solar Feasibility Score', f"{session_data.property_data.solarFeasibilityScore}/10"],
    ]
    
    property_table = Table(property_data, colWidths=[2.5*inch, 3.5*inch])
    property_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db'))
    ]))
    
    elements.append(property_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Organize opportunities into tiers
    tiers = organize_opportunities_into_tiers(session_data.opportunities)
    
    # Tier 1: Special Instructions (always included)
    elements.append(Paragraph(f"<b>Tier 1: {tiers[0].title}</b>", tier_title_style))
    elements.append(Paragraph(tiers[0].description, body_style))
    elements.append(Spacer(1, 0.1*inch))
    
    # Build utility-specific instructions for Tier 1
    utility_provider = session_data.property_data.utilityProvider
    utility_portal_text = ""
    
    if utility_provider == "LADWP":
        utility_portal_text = "• LADWP account: ladwp.com (electricity & water)<br/>"
    elif utility_provider == "Pasadena Water & Power":
        utility_portal_text = "• Pasadena Water & Power: cityofpasadena.net/water-and-power<br/>"
    elif utility_provider == "Glendale Water & Power":
        utility_portal_text = "• Glendale Water & Power: glendaleca.gov/water-power<br/>"
    elif utility_provider == "Burbank Water & Power":
        utility_portal_text = "• Burbank Water & Power: burbankwaterandpower.com<br/>"
    else:
        utility_portal_text = f"• {utility_provider}: Check your utility provider's website<br/>"
    
    utility_portal_text += "       • SoCalGas account: socalgas.com (natural gas)<br/>"
    
    tier1_instructions = f"""
    <b>Action Steps:</b><br/>
    1. <b>Set up your utility portals:</b><br/>
       {utility_portal_text}
    2. <b>Download the last 12 months of bills</b> (if available) to establish your baseline usage and costs<br/>
    3. <b>Create a simple tracking spreadsheet</b> with columns for: Date, Electric Bill, Gas Bill, Water Bill, Total<br/>
    4. <b>Note your current monthly averages</b> before making any changes<br/>
    <br/>
    <b>Why this matters:</b> This baseline data will help you measure the actual impact of every change you make.
    Spend 30-60 minutes on this step before moving to Tier 2.
    """
    elements.append(Paragraph(tier1_instructions, small_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Remaining Tiers (2-5)
    for tier_group in tiers[1:]:
        elements.append(Paragraph(f"<b>Tier {tier_group.tier}: {tier_group.title}</b>", tier_title_style))
        elements.append(Paragraph(tier_group.description, body_style))
        elements.append(Spacer(1, 0.1*inch))
        
        if tier_group.opportunities:
            for opp in tier_group.opportunities:
                # Opportunity name and savings
                opp_title = f"<b>{opp.name}</b>"
                if opp.upfrontCost.max == 0:
                    opp_title += " [FREE]"
                opp_title += f" - Annual Savings: {format_currency(opp.annualSavings)}"
                elements.append(Paragraph(opp_title, body_style))
                
                # Cost and difficulty
                if opp.upfrontCost.max == 0:
                    cost_text = "Your Cost: $0"
                else:
                    cost_text = f"Your Cost: {format_currency(opp.upfrontCost.min)}–{format_currency(opp.upfrontCost.max)}"
                cost_text += f" | Effort: {opp.difficulty}"
                elements.append(Paragraph(cost_text, small_style))
                
                # Benefits
                if opp.benefits:
                    elements.append(Paragraph(f"<i>{opp.benefits[0]}</i>", small_style))
                
                # Next steps
                if opp.nextSteps:
                    next_steps_text = "<b>Next Steps:</b><br/>"
                    for i, step in enumerate(opp.nextSteps[:2], 1):
                        next_steps_text += f"{i}. {step}<br/>"
                    elements.append(Paragraph(next_steps_text, small_style))
                
                elements.append(Spacer(1, 0.15*inch))
        else:
            elements.append(Paragraph(
                "No specific programs in this tier for your property. Move to the next tier when ready.",
                small_style
            ))
            elements.append(Spacer(1, 0.1*inch))
    
    elements.append(PageBreak())
    
    # Add Resources Section Header
    elements.append(Paragraph("Program Resources & Contact Information", heading_style))
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph(
        "Quick reference for all the programs, rebates, and services mentioned in your action plan",
        small_style
    ))
    elements.append(Spacer(1, 0.2*inch))
    
    # Build utility contacts based on property's utility provider
    utility_provider = session_data.property_data.utilityProvider
    resources_data = []
    
    # Add relevant utility provider
    if utility_provider == "LADWP":
        resources_data.append(['LADWP', '(800) 342-5397', 'ladwp.com'])
    elif utility_provider == "Pasadena Water & Power":
        resources_data.append(['Pasadena Water & Power', '(626) 744-4005', 'cityofpasadena.net/water-and-power'])
    elif utility_provider == "Glendale Water & Power":
        resources_data.append(['Glendale Water & Power', '(818) 548-2000', 'glendaleca.gov/water-power'])
    elif utility_provider == "Burbank Water & Power":
        resources_data.append(['Burbank Water & Power', '(818) 238-3700', 'burbankwaterandpower.com'])
    else:
        # Default to LADWP if unknown
        resources_data.append(['LADWP', '(800) 342-5397', 'ladwp.com'])
    
    # Add SoCalGas (common for most properties)
    resources_data.append(['SoCalGas', '(877) 238-0092', 'socalgas.com/rebates'])
    
    # Add government programs
    resources_data.append(['LA County Weatherization', '(626) 569-4328', 'dcba.lacounty.gov/weatherization'])
    resources_data.append(['ENERGY STAR', '-', 'energystar.gov'])
    
    resources_table = Table(resources_data, colWidths=[2.5*inch, 1.5*inch, 2.5*inch])
    resources_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f9fafb')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),  # Make first column bold
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    elements.append(resources_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Key Principles for Success
    elements.append(Paragraph("Key Principles for Success", heading_style))
    elements.append(Spacer(1, 0.1*inch))
    
    principles = """
    • <b>Complete Tier 1 first:</b> Establish your baseline before making any changes<br/>
    • <b>Track everything:</b> Document the date of each change and compare monthly bills<br/>
    • <b>Wait 3-6 months:</b> Before major investments (Tier 5), verify your usage patterns with data<br/>
    • <b>Start with free programs:</b> Maximize no-cost opportunities before spending money<br/>
    • <b>Use your data:</b> Let actual usage inform which upgrades make sense for your home
    """
    elements.append(Paragraph(principles, body_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Footer with HOCS branding
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#6b7280'),
        alignment=TA_CENTER
    )
    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph(
        f"Generated by <b>HOCS</b> - Home Ownership Cost Savings | {datetime.now().strftime('%B %d, %Y')}",
        footer_style
    ))
    
    # Build PDF
    doc.build(elements)
    
    # Get the value of the BytesIO buffer
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes