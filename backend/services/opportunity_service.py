"""
Service for generating savings opportunities based on property attributes.
Ports logic from frontend/src/utils/mockData.ts generateMockOpportunities()
"""
from typing import List
from models import PropertyData, SavingsOpportunity, OfficialResource, Rebate, UpfrontCost


def generate_opportunities(property_data: PropertyData) -> List[SavingsOpportunity]:
    """
    Generate savings opportunities based on property attributes.
    Matches frontend logic from generateMockOpportunities()
    """
    opportunities = []
    
    # Detect if this is LA County based on utility provider
    is_la_county = property_data.utilityProvider in [
        "Pasadena Water & Power", "LADWP", "Glendale Water & Power",
        "Burbank Water & Power", "Santa Monica Municipal Utilities"
    ]
    
    # NO-COST / LOW-COST OPPORTUNITIES (Prioritized)
    
    # Free Home Energy Audit - Dynamic based on location
    if is_la_county:
        audit_next_steps = [
            'Contact your utility provider to schedule free audit',
            'Pasadena Water & Power: (626) 744-4005',
            'LADWP: (800) 342-5397',
            'Document current utility bills for comparison'
        ]
        audit_resources = [
            OfficialResource(name='Pasadena Water & Power Energy Programs', url='https://www.cityofpasadena.net/water-and-power/energy-efficiency/', type='utility'),
            OfficialResource(name='LADWP Energy Efficiency Programs', url='https://www.ladwp.com/ladwp/faces/ladwp/residential/r-savemoney/r-sm-rebatesandprograms', type='utility'),
            OfficialResource(name='California Energy Commission', url='https://www.energy.ca.gov/programs-and-topics/programs/energy-efficiency', type='government')
        ]
    else:
        audit_next_steps = [
            f'Contact {property_data.utilityProvider} to schedule free audit',
            'Check your utility provider website for energy efficiency programs',
            'Document current utility bills for comparison',
            'Visit California Energy Commission for statewide programs'
        ]
        audit_resources = [
            OfficialResource(name='California Energy Commission', url='https://www.energy.ca.gov/programs-and-topics/programs/energy-efficiency', type='government'),
            OfficialResource(name='Find Your Utility Provider Programs', url='https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/electric-costs/energy-efficiency-ee', type='government')
        ]
    
    opportunities.append(SavingsOpportunity(
        id='energy-audit',
        category='energy',
        name='Schedule Free Home Energy Audit',
        annualSavings=300,
        upfrontCost=UpfrontCost(min=0, max=0),
        rebates=[],
        paybackMonths=0,
        difficulty='DIY',
        confidenceScore=95,
        benefits=[
            'Identify energy waste and inefficiencies at no cost',
            'Get personalized recommendations from certified auditor',
            'Qualify for additional rebates and incentives',
            'Track baseline energy usage for future improvements'
        ],
        nextSteps=audit_next_steps,
        methodology='Free energy audits identify an average of $300-500/year in savings opportunities. This is the foundation for measuring and managing your home\'s energy performance.',
        officialResources=audit_resources
    ))
    
    # Water Conservation Kit - Dynamic based on location
    if is_la_county:
        water_next_steps = [
            'Order free kit from SoCal Water$mart: bewaterwise.com',
            'Install fixtures and note installation date',
            'Compare next water bill to establish baseline savings',
            'Track monthly water usage to measure impact'
        ]
        water_methodology = 'Metropolitan Water District provides free conservation kits. Average household saves 120 gallons/month = $120/year. What gets measured gets managed - track your water bills monthly.'
        water_resources = [
            OfficialResource(name='SoCal Water$mart (Metropolitan Water District)', url='https://www.bewaterwise.com/', type='utility'),
            OfficialResource(name='LA County Water Conservation', url='https://dpw.lacounty.gov/wwd/web/Conservation/', type='government'),
            OfficialResource(name='California Water Service', url='https://www.calwater.com/conservation/', type='utility')
        ]
    else:
        water_next_steps = [
            'Contact your local water district for free conservation kits',
            'Check California Water Service for available programs',
            'Install fixtures and note installation date',
            'Track monthly water usage to measure impact'
        ]
        water_methodology = 'Many California water districts provide free conservation kits. Average household saves 120 gallons/month = $120/year. What gets measured gets managed - track your water bills monthly.'
        water_resources = [
            OfficialResource(name='California Water Service', url='https://www.calwater.com/conservation/', type='utility'),
            OfficialResource(name='Save Our Water (Statewide)', url='https://saveourwater.com/', type='government'),
            OfficialResource(name='California Department of Water Resources', url='https://water.ca.gov/Programs/Water-Use-And-Efficiency', type='government')
        ]
    
    opportunities.append(SavingsOpportunity(
        id='water-kit',
        category='water',
        name='Request Free Water Conservation Kit',
        annualSavings=120,
        upfrontCost=UpfrontCost(min=0, max=0),
        rebates=[],
        paybackMonths=0,
        difficulty='DIY',
        confidenceScore=98,
        benefits=[
            'Free kit includes low-flow showerheads and faucet aerators',
            'Reduce water usage by 20-30% immediately',
            'Easy DIY installation in under 30 minutes',
            'Start tracking water savings right away'
        ],
        nextSteps=water_next_steps,
        methodology=water_methodology,
        officialResources=water_resources
    ))
    
    # LED Lighting Conversion
    opportunities.append(SavingsOpportunity(
        id='led-lighting',
        category='energy',
        name='Convert to LED Lighting (Start with High-Use Areas)',
        annualSavings=150,
        upfrontCost=UpfrontCost(min=50, max=150),
        rebates=[],
        paybackMonths=8,
        difficulty='DIY',
        confidenceScore=98,
        benefits=[
            'Reduce lighting costs by 75% in converted areas',
            'LED bulbs last 15-25 years vs 1-2 years for incandescent',
            'Instant energy savings you can measure on next bill',
            'No special tools or skills required'
        ],
        nextSteps=[
            'Identify 10 highest-use bulbs (kitchen, living room, outdoor)',
            'Purchase LED replacements in bulk for best price',
            'Note your current electric bill before conversion',
            'Track monthly electric bills to measure savings'
        ],
        methodology='Converting 10 high-use bulbs saves ~$150/year. Start small, measure impact, then expand. Track your electric bill monthly to see the difference.',
        officialResources=[
            OfficialResource(name='ENERGY STAR Lighting Guide', url='https://www.energystar.gov/products/lighting_fans', type='government'),
            OfficialResource(name='California Energy Commission - Lighting', url='https://www.energy.ca.gov/programs-and-topics/programs/appliance-efficiency-program/lighting', type='government')
        ]
    ))
    
    # Smart Power Strips
    opportunities.append(SavingsOpportunity(
        id='power-strips',
        category='energy',
        name='Install Smart Power Strips to Eliminate Phantom Load',
        annualSavings=100,
        upfrontCost=UpfrontCost(min=60, max=120),
        rebates=[],
        paybackMonths=9,
        difficulty='DIY',
        confidenceScore=92,
        benefits=[
            'Eliminate "vampire" energy drain from devices on standby',
            'Automatically cut power to unused devices',
            'Reduce electric bill by 5-10% with no behavior change',
            'Easy to measure impact on monthly bills'
        ],
        nextSteps=[
            'Identify entertainment centers and home office areas',
            'Purchase smart power strips with auto-shutoff',
            'Note current monthly electric usage',
            'Compare bills after 1 month to measure savings'
        ],
        methodology='Phantom load accounts for 5-10% of home electricity use. Smart power strips eliminate this waste. Average savings: $100/year. Track monthly to verify.',
        officialResources=[
            OfficialResource(name='U.S. Department of Energy - Standby Power', url='https://www.energy.gov/energysaver/articles/standby-power-and-how-reduce-it', type='government'),
            OfficialResource(name='ENERGY STAR Smart Power Strips', url='https://www.energystar.gov/products/smart_power_strips', type='government')
        ]
    ))
    
    # Weatherization Program - Dynamic based on location
    if is_la_county:
        weatherization_next_steps = [
            'Check eligibility at lacounty.gov/weatherization',
            'Gather income documentation for application',
            'Schedule home assessment if qualified',
            'Track utility bills before and after to measure impact'
        ]
        weatherization_methodology = 'LA County Weatherization Program provides free upgrades to eligible households. Average savings: $400/year. Document your baseline energy use to measure the improvement.'
        weatherization_resources = [
            OfficialResource(name='LA County Weatherization Program', url='https://dcba.lacounty.gov/weatherization/', type='government'),
            OfficialResource(name='California Department of Community Services - Weatherization', url='https://www.csd.ca.gov/Pages/WeatherizationProgram.aspx', type='government'),
            OfficialResource(name='U.S. Department of Energy - Weatherization', url='https://www.energy.gov/scep/wap/weatherization-assistance-program', type='government')
        ]
    else:
        weatherization_next_steps = [
            'Check eligibility at csd.ca.gov/weatherization',
            'Contact your local Community Action Agency',
            'Gather income documentation for application',
            'Track utility bills before and after to measure impact'
        ]
        weatherization_methodology = 'California Weatherization Program provides free upgrades to eligible households statewide. Average savings: $400/year. Document your baseline energy use to measure the improvement.'
        weatherization_resources = [
            OfficialResource(name='California Department of Community Services - Weatherization', url='https://www.csd.ca.gov/Pages/WeatherizationProgram.aspx', type='government'),
            OfficialResource(name='U.S. Department of Energy - Weatherization', url='https://www.energy.gov/scep/wap/weatherization-assistance-program', type='government'),
            OfficialResource(name='Find Your Local Community Action Agency', url='https://www.csd.ca.gov/Pages/LocalOffices.aspx', type='government')
        ]
    
    opportunities.append(SavingsOpportunity(
        id='weatherization',
        category='energy',
        name='Apply for Free Weatherization Assistance Program',
        annualSavings=400,
        upfrontCost=UpfrontCost(min=0, max=0),
        rebates=[],
        paybackMonths=0,
        difficulty='Professional',
        confidenceScore=85,
        benefits=[
            'Free insulation, air sealing, and efficiency upgrades',
            'Income-qualified program (up to 200% of federal poverty level)',
            'Professional installation at no cost',
            'Reduce heating/cooling costs by 20-30%'
        ],
        nextSteps=weatherization_next_steps,
        methodology=weatherization_methodology,
        officialResources=weatherization_resources
    ))
    
    # MEDIUM-COST OPPORTUNITIES
    
    # Smart Thermostat
    opportunities.append(SavingsOpportunity(
        id='smart-thermostat',
        category='energy',
        name='Install Smart Thermostat with Utility Rebate',
        annualSavings=180,
        upfrontCost=UpfrontCost(min=125, max=225),
        rebates=[
            Rebate(name='SoCalGas Smart Thermostat Rebate', amount=75, link='https://socalgas.com/save-money-and-energy/rebates-and-incentives')
        ],
        paybackMonths=8,
        difficulty='DIY',
        confidenceScore=90,
        benefits=[
            'Reduce HVAC costs by 10-15% automatically',
            'Track energy usage in real-time via app',
            'Learning algorithms optimize comfort and savings',
            'Qualify for $75 utility rebate'
        ],
        nextSteps=[
            'Check HVAC compatibility at nest.com or ecobee.com',
            'Apply for SoCalGas rebate before purchase',
            'Install thermostat and connect to app',
            'Monitor daily/weekly energy reports to track savings'
        ],
        methodology='Smart thermostats reduce HVAC costs by 12% average. Net cost after rebate: $125-150. Payback in 8-10 months. Built-in tracking helps you measure and manage energy use.',
        officialResources=[
            OfficialResource(name='SoCalGas Rebates & Incentives', url='https://socalgas.com/save-money-and-energy/rebates-and-incentives', type='utility'),
            OfficialResource(name='ENERGY STAR Smart Thermostats', url='https://www.energystar.gov/products/smart_thermostats', type='government')
        ]
    ))
    
    # Water-Efficient Landscaping Rebate
    opportunities.append(SavingsOpportunity(
        id='turf-removal',
        category='water',
        name='Turf Removal & Native Landscaping Rebate',
        annualSavings=300,
        upfrontCost=UpfrontCost(min=500, max=1500),
        rebates=[
            Rebate(name='SoCal Water$mart Turf Replacement ($2/sqft)', amount=1000, link='https://socalwatersmart.com/turf-replacement')
        ],
        paybackMonths=12,
        difficulty='Professional',
        confidenceScore=88,
        benefits=[
            'Receive $2 per square foot of turf removed (up to 5,000 sqft)',
            'Reduce outdoor water use by 50-70%',
            'Lower maintenance costs (no mowing, less watering)',
            'Drought-resistant landscaping increases property value'
        ],
        nextSteps=[
            'Measure lawn area to calculate rebate amount',
            'Pre-qualify at socalwatersmart.com before starting',
            'Get quotes from certified landscapers',
            'Track water bills monthly to measure savings'
        ],
        methodology='Outdoor watering accounts for 50% of residential water use. Rebate covers most conversion costs. Average 500 sqft removal = $1,000 rebate. Saves $300/year in water costs. Track monthly bills to verify.',
        officialResources=[
            OfficialResource(name='SoCal Water$mart Turf Replacement Program', url='https://socalwatersmart.com/turf-replacement/', type='program'),
            OfficialResource(name='Metropolitan Water District Rebates', url='https://www.mwdh2o.com/rebates/', type='utility'),
            OfficialResource(name='California Water-Efficient Landscape Ordinance', url='https://water.ca.gov/Programs/Water-Use-And-Efficiency/Urban-Water-Use-Efficiency/Model-Water-Efficient-Landscape-Ordinance', type='government')
        ]
    ))
    
    # Attic Insulation Upgrade (for older homes)
    if property_data.yearBuilt < 1980:
        opportunities.append(SavingsOpportunity(
            id='attic-insulation',
            category='energy',
            name='Attic Insulation Upgrade with Energy Rebate',
            annualSavings=420,
            upfrontCost=UpfrontCost(min=900, max=2200),
            rebates=[
                Rebate(name='SoCalGas Energy Savings Assistance', amount=300, link='https://socalgas.com/save-money-and-energy/rebates-and-incentives')
            ],
            paybackMonths=28,
            difficulty='Professional',
            confidenceScore=85,
            benefits=[
                'Reduce heating/cooling costs by 20-30%',
                'Improve home comfort year-round',
                'Qualify for $300 utility rebate',
                'Measurable impact on monthly energy bills'
            ],
            nextSteps=[
                'Schedule free home energy audit first (see above)',
                'Get quotes from 3 certified insulation contractors',
                'Apply for SoCalGas rebate before installation',
                'Track monthly utility bills to measure ROI'
            ],
            methodology='Homes built before 1980 typically have R-11 or less insulation. Upgrading to R-38 saves $420/year average. Net cost after rebate: $600-1,900. Track heating/cooling costs monthly to verify savings.',
            officialResources=[
                OfficialResource(name='SoCalGas Energy Efficiency Programs', url='https://socalgas.com/save-money-and-energy/rebates-and-incentives', type='utility'),
                OfficialResource(name='California Energy Commission - Insulation', url='https://www.energy.ca.gov/programs-and-topics/programs/building-energy-efficiency-standards', type='government'),
                OfficialResource(name='U.S. Department of Energy - Insulation', url='https://www.energy.gov/energysaver/insulation', type='government')
            ]
        ))
    
    # LARGER INVESTMENT OPPORTUNITIES
    
    # Solar Installation (for high feasibility properties)
    if property_data.solarFeasibilityScore > 70:
        opportunities.append(SavingsOpportunity(
            id='solar-installation',
            category='solar',
            name='Residential Solar with Federal Tax Credit',
            annualSavings=2400,
            upfrontCost=UpfrontCost(min=10500, max=17500),
            rebates=[
                Rebate(name='Federal Solar Tax Credit (30%)', amount=6000, link='https://www.energy.gov/eere/solar/homeowners-guide-federal-tax-credit-solar-photovoltaics'),
                Rebate(name='CA SGIP Battery Storage Incentive', amount=1000, link='https://www.selfgenca.com')
            ],
            paybackMonths=48,
            difficulty='Specialist',
            confidenceScore=88,
            benefits=[
                'Eliminate 80-90% of electric bills',
                '30% federal tax credit reduces net cost significantly',
                'Additional $1,000 for battery storage',
                'Monitor production and savings via app daily'
            ],
            nextSteps=[
                'Get 3 quotes from certified solar installers (energysage.com)',
                'Review 12 months of utility bills to size system correctly',
                'Apply for SGIP battery incentive (limited funds)',
                'Use monitoring app to track daily production and savings'
            ],
            methodology=f'Solar feasibility score: {property_data.solarFeasibilityScore}/100. Average LA County electric bill: $200/month. 6kW system costs $15,000-25,000. After 30% tax credit: $10,500-17,500. Payback: 4-6 years. Built-in monitoring lets you track every kWh produced.',
            officialResources=[
                OfficialResource(name='U.S. Department of Energy - Solar Tax Credit', url='https://www.energy.gov/eere/solar/homeowners-guide-federal-tax-credit-solar-photovoltaics', type='government'),
                OfficialResource(name='California SGIP (Self-Generation Incentive Program)', url='https://www.selfgenca.com/', type='program'),
                OfficialResource(name='Go Solar California', url='https://www.gosolarcalifornia.org/', type='government'),
                OfficialResource(name='EnergySage Solar Marketplace', url='https://www.energysage.com/', type='program')
            ]
        ))
    
    # Heat Pump Water Heater
    opportunities.append(SavingsOpportunity(
        id='heat-pump-water-heater',
        category='energy',
        name='Heat Pump Water Heater with Rebates',
        annualSavings=350,
        upfrontCost=UpfrontCost(min=1200, max=2500),
        rebates=[
            Rebate(name='SoCalGas Water Heater Rebate', amount=300, link='https://socalgas.com/save-money-and-energy/rebates-and-incentives'),
            Rebate(name='Federal Energy Efficiency Tax Credit', amount=300, link='https://www.energystar.gov/about/federal_tax_credits')
        ],
        paybackMonths=36,
        difficulty='Professional',
        confidenceScore=82,
        benefits=[
            'Use 60% less energy than standard electric water heaters',
            'Qualify for $600 in combined rebates',
            'Longer lifespan (12-15 years vs 8-10 years)',
            'Track energy savings via utility bills'
        ],
        nextSteps=[
            'Check if current water heater is 8+ years old',
            'Get quotes from licensed plumbers',
            'Apply for rebates before installation',
            'Compare gas/electric bills monthly to measure savings'
        ],
        methodology='Water heating accounts for 18% of home energy use. Heat pump water heaters save $350/year average. Net cost after $600 rebates: $600-1,900. Payback: 2-5 years. Track monthly utility costs to verify.',
        officialResources=[
            OfficialResource(name='SoCalGas Water Heater Rebates', url='https://socalgas.com/save-money-and-energy/rebates-and-incentives', type='utility'),
            OfficialResource(name='ENERGY STAR Water Heaters', url='https://www.energystar.gov/products/water_heaters', type='government'),
            OfficialResource(name='Federal Tax Credits for Energy Efficiency', url='https://www.energystar.gov/about/federal_tax_credits', type='government')
        ]
    ))
    
    # Window Replacement (for older homes)
    if property_data.yearBuilt < 1990:
        opportunities.append(SavingsOpportunity(
            id='window-replacement',
            category='energy',
            name='Energy-Efficient Window Replacement',
            annualSavings=300,
            upfrontCost=UpfrontCost(min=3000, max=8000),
            rebates=[
                Rebate(name='Federal Energy Efficiency Tax Credit', amount=600, link='https://www.energystar.gov/about/federal_tax_credits')
            ],
            paybackMonths=96,
            difficulty='Professional',
            confidenceScore=75,
            benefits=[
                'Reduce heating/cooling costs by 10-15%',
                'Improve home comfort and reduce drafts',
                'Qualify for $600 federal tax credit',
                'Increase home value and curb appeal'
            ],
            nextSteps=[
                'Prioritize windows with visible damage or drafts',
                'Get quotes for ENERGY STAR certified windows',
                'Consider phased approach (worst windows first)',
                'Track heating/cooling costs to measure impact'
            ],
            methodology='Homes built before 1990 typically have single-pane windows. Upgrading to double-pane saves $300/year. Net cost after tax credit: $2,400-7,400. Long payback but measurable comfort improvement. Track seasonal utility costs.',
            officialResources=[
                OfficialResource(name='ENERGY STAR Windows & Doors', url='https://www.energystar.gov/products/building_products/residential_windows_doors_and_skylights', type='government'),
                OfficialResource(name='Federal Tax Credits for Energy Efficiency', url='https://www.energystar.gov/about/federal_tax_credits', type='government'),
                OfficialResource(name='California Energy Commission - Windows', url='https://www.energy.ca.gov/programs-and-topics/programs/building-energy-efficiency-standards', type='government')
            ]
        ))
    
    return opportunities