import { PropertyData, SavingsOpportunity } from '@/types/property';

export const mockPropertyData: Record<string, PropertyData> = {
  '123 Main St, Pasadena, CA 91101': {
    address: '123 Main St, Pasadena, CA 91101',
    yearBuilt: 1965,
    squareFeet: 1850,
    bedrooms: 3,
    bathrooms: 2,
    lotSize: 6500,
    lastSalePrice: 725000,
    assessedValue: 680000,
    propertyTaxEstimate: 8160,
    utilityProvider: 'Pasadena Water & Power',
    wildfireZone: 'Medium',
    roofAge: 18,
    solarFeasibilityScore: 85,
    permitHistory: ['HVAC replacement (2015)', 'Kitchen remodel (2018)']
  },
  '456 Oak Ave, Los Angeles, CA 90012': {
    address: '456 Oak Ave, Los Angeles, CA 90012',
    yearBuilt: 1952,
    squareFeet: 1450,
    bedrooms: 2,
    bathrooms: 1,
    lotSize: 5200,
    lastSalePrice: 625000,
    assessedValue: 590000,
    propertyTaxEstimate: 7080,
    utilityProvider: 'LADWP',
    wildfireZone: 'Low',
    roofAge: 12,
    solarFeasibilityScore: 72,
    permitHistory: ['Electrical upgrade (2019)']
  }
};

export const laCountyAddresses = [
  '123 Main St, Pasadena, CA 91101',
  '456 Oak Ave, Los Angeles, CA 90012',
  '789 Elm St, Glendale, CA 91201',
  '321 Pine Rd, Burbank, CA 91502',
  '654 Maple Dr, Santa Monica, CA 90401'
];

export const generateMockOpportunities = (property: PropertyData): SavingsOpportunity[] => {
  const opportunities: SavingsOpportunity[] = [];

  // NO-COST / LOW-COST OPPORTUNITIES (Prioritized)

  // Free Home Energy Audit
  opportunities.push({
    id: 'energy-audit',
    category: 'energy',
    name: 'Schedule Free Home Energy Audit',
    annualSavings: 300,
    upfrontCost: { min: 0, max: 0 },
    rebates: [],
    paybackMonths: 0,
    difficulty: 'DIY',
    confidenceScore: 95,
    benefits: [
      'Identify energy waste and inefficiencies at no cost',
      'Get personalized recommendations from certified auditor',
      'Qualify for additional rebates and incentives',
      'Track baseline energy usage for future improvements'
    ],
    nextSteps: [
      'Contact your utility provider to schedule free audit',
      'Pasadena Water & Power: (626) 744-4005',
      'LADWP: (800) 342-5397',
      'Document current utility bills for comparison'
    ],
    methodology: 'Free energy audits identify an average of $300-500/year in savings opportunities. This is the foundation for measuring and managing your home\'s energy performance.'
  });

  // Water Conservation Kit
  opportunities.push({
    id: 'water-kit',
    category: 'water',
    name: 'Request Free Water Conservation Kit',
    annualSavings: 120,
    upfrontCost: { min: 0, max: 0 },
    rebates: [],
    paybackMonths: 0,
    difficulty: 'DIY',
    confidenceScore: 98,
    benefits: [
      'Free kit includes low-flow showerheads and faucet aerators',
      'Reduce water usage by 20-30% immediately',
      'Easy DIY installation in under 30 minutes',
      'Start tracking water savings right away'
    ],
    nextSteps: [
      'Order free kit from SoCal Water$mart: bewaterwise.com',
      'Install fixtures and note installation date',
      'Compare next water bill to establish baseline savings',
      'Track monthly water usage to measure impact'
    ],
    methodology: 'Metropolitan Water District provides free conservation kits. Average household saves 120 gallons/month = $120/year. What gets measured gets managed - track your water bills monthly.'
  });

  // LED Lighting Conversion
  opportunities.push({
    id: 'led-lighting',
    category: 'energy',
    name: 'Convert to LED Lighting (Start with High-Use Areas)',
    annualSavings: 150,
    upfrontCost: { min: 50, max: 150 },
    rebates: [],
    paybackMonths: 8,
    difficulty: 'DIY',
    confidenceScore: 98,
    benefits: [
      'Reduce lighting costs by 75% in converted areas',
      'LED bulbs last 15-25 years vs 1-2 years for incandescent',
      'Instant energy savings you can measure on next bill',
      'No special tools or skills required'
    ],
    nextSteps: [
      'Identify 10 highest-use bulbs (kitchen, living room, outdoor)',
      'Purchase LED replacements in bulk for best price',
      'Note your current electric bill before conversion',
      'Track monthly electric bills to measure savings'
    ],
    methodology: 'Converting 10 high-use bulbs saves ~$150/year. Start small, measure impact, then expand. Track your electric bill monthly to see the difference.'
  });

  // Smart Power Strips
  opportunities.push({
    id: 'power-strips',
    category: 'energy',
    name: 'Install Smart Power Strips to Eliminate Phantom Load',
    annualSavings: 100,
    upfrontCost: { min: 60, max: 120 },
    rebates: [],
    paybackMonths: 9,
    difficulty: 'DIY',
    confidenceScore: 92,
    benefits: [
      'Eliminate "vampire" energy drain from devices on standby',
      'Automatically cut power to unused devices',
      'Reduce electric bill by 5-10% with no behavior change',
      'Easy to measure impact on monthly bills'
    ],
    nextSteps: [
      'Identify entertainment centers and home office areas',
      'Purchase smart power strips with auto-shutoff',
      'Note current monthly electric usage',
      'Compare bills after 1 month to measure savings'
    ],
    methodology: 'Phantom load accounts for 5-10% of home electricity use. Smart power strips eliminate this waste. Average savings: $100/year. Track monthly to verify.'
  });

  // Weatherization Program
  opportunities.push({
    id: 'weatherization',
    category: 'energy',
    name: 'Apply for Free Weatherization Assistance Program',
    annualSavings: 400,
    upfrontCost: { min: 0, max: 0 },
    rebates: [],
    paybackMonths: 0,
    difficulty: 'Professional',
    confidenceScore: 85,
    benefits: [
      'Free insulation, air sealing, and efficiency upgrades',
      'Income-qualified program (up to 200% of federal poverty level)',
      'Professional installation at no cost',
      'Reduce heating/cooling costs by 20-30%'
    ],
    nextSteps: [
      'Check eligibility at lacounty.gov/weatherization',
      'Gather income documentation for application',
      'Schedule home assessment if qualified',
      'Track utility bills before and after to measure impact'
    ],
    methodology: 'LA County Weatherization Program provides free upgrades to eligible households. Average savings: $400/year. Document your baseline energy use to measure the improvement.'
  });

  // MEDIUM-COST OPPORTUNITIES

  // Smart Thermostat
  opportunities.push({
    id: 'smart-thermostat',
    category: 'energy',
    name: 'Install Smart Thermostat with Utility Rebate',
    annualSavings: 180,
    upfrontCost: { min: 125, max: 225 },
    rebates: [
      { name: 'SoCalGas Smart Thermostat Rebate', amount: 75, link: 'https://socalgas.com/save-money-and-energy/rebates-and-incentives' }
    ],
    paybackMonths: 8,
    difficulty: 'DIY',
    confidenceScore: 90,
    benefits: [
      'Reduce HVAC costs by 10-15% automatically',
      'Track energy usage in real-time via app',
      'Learning algorithms optimize comfort and savings',
      'Qualify for $75 utility rebate'
    ],
    nextSteps: [
      'Check HVAC compatibility at nest.com or ecobee.com',
      'Apply for SoCalGas rebate before purchase',
      'Install thermostat and connect to app',
      'Monitor daily/weekly energy reports to track savings'
    ],
    methodology: 'Smart thermostats reduce HVAC costs by 12% average. Net cost after rebate: $125-150. Payback in 8-10 months. Built-in tracking helps you measure and manage energy use.'
  });

  // Water-Efficient Landscaping Rebate
  opportunities.push({
    id: 'turf-removal',
    category: 'water',
    name: 'Turf Removal & Native Landscaping Rebate',
    annualSavings: 300,
    upfrontCost: { min: 500, max: 1500 },
    rebates: [
      { name: 'SoCal Water$mart Turf Replacement', amount: 2, link: 'https://socalwatersmart.com/turf-replacement' }
    ],
    paybackMonths: 12,
    difficulty: 'Professional',
    confidenceScore: 88,
    benefits: [
      'Receive $2 per square foot of turf removed (up to 5,000 sqft)',
      'Reduce outdoor water use by 50-70%',
      'Lower maintenance costs (no mowing, less watering)',
      'Drought-resistant landscaping increases property value'
    ],
    nextSteps: [
      'Measure lawn area to calculate rebate amount',
      'Pre-qualify at socalwatersmart.com before starting',
      'Get quotes from certified landscapers',
      'Track water bills monthly to measure savings'
    ],
    methodology: 'Outdoor watering accounts for 50% of residential water use. Rebate covers most conversion costs. Average 500 sqft removal = $1,000 rebate. Saves $300/year in water costs. Track monthly bills to verify.'
  });

  // Attic Insulation Upgrade
  if (property.yearBuilt < 1980) {
    opportunities.push({
      id: 'attic-insulation',
      category: 'energy',
      name: 'Attic Insulation Upgrade with Energy Rebate',
      annualSavings: 420,
      upfrontCost: { min: 900, max: 2200 },
      rebates: [
        { name: 'SoCalGas Energy Savings Assistance', amount: 300, link: 'https://socalgas.com/save-money-and-energy/rebates-and-incentives' }
      ],
      paybackMonths: 28,
      difficulty: 'Professional',
      confidenceScore: 85,
      benefits: [
        'Reduce heating/cooling costs by 20-30%',
        'Improve home comfort year-round',
        'Qualify for $300 utility rebate',
        'Measurable impact on monthly energy bills'
      ],
      nextSteps: [
        'Schedule free home energy audit first (see above)',
        'Get quotes from 3 certified insulation contractors',
        'Apply for SoCalGas rebate before installation',
        'Track monthly utility bills to measure ROI'
      ],
      methodology: 'Homes built before 1980 typically have R-11 or less insulation. Upgrading to R-38 saves $420/year average. Net cost after rebate: $600-1,900. Track heating/cooling costs monthly to verify savings.'
    });
  }

  // LARGER INVESTMENT OPPORTUNITIES

  // Solar Installation
  if (property.solarFeasibilityScore > 70) {
    opportunities.push({
      id: 'solar-installation',
      category: 'solar',
      name: 'Residential Solar with Federal Tax Credit',
      annualSavings: 2400,
      upfrontCost: { min: 10500, max: 17500 },
      rebates: [
        { name: 'Federal Solar Tax Credit (30%)', amount: 6000, link: 'https://www.energy.gov/eere/solar/homeowners-guide-federal-tax-credit-solar-photovoltaics' },
        { name: 'CA SGIP Battery Storage Incentive', amount: 1000, link: 'https://www.selfgenca.com' }
      ],
      paybackMonths: 48,
      difficulty: 'Specialist',
      confidenceScore: 88,
      benefits: [
        'Eliminate 80-90% of electric bills',
        '30% federal tax credit reduces net cost significantly',
        'Additional $1,000 for battery storage',
        'Monitor production and savings via app daily'
      ],
      nextSteps: [
        'Get 3 quotes from certified solar installers (energysage.com)',
        'Review 12 months of utility bills to size system correctly',
        'Apply for SGIP battery incentive (limited funds)',
        'Use monitoring app to track daily production and savings'
      ],
      methodology: 'Solar feasibility score: 85/100. Average LA County electric bill: $200/month. 6kW system costs $15,000-25,000. After 30% tax credit: $10,500-17,500. Payback: 4-6 years. Built-in monitoring lets you track every kWh produced.'
    });
  }

  // Heat Pump Water Heater
  opportunities.push({
    id: 'heat-pump-water-heater',
    category: 'energy',
    name: 'Heat Pump Water Heater with Rebates',
    annualSavings: 350,
    upfrontCost: { min: 1200, max: 2500 },
    rebates: [
      { name: 'SoCalGas Water Heater Rebate', amount: 300, link: 'https://socalgas.com/save-money-and-energy/rebates-and-incentives' },
      { name: 'Federal Energy Efficiency Tax Credit', amount: 300, link: 'https://www.energystar.gov/about/federal_tax_credits' }
    ],
    paybackMonths: 36,
    difficulty: 'Professional',
    confidenceScore: 82,
    benefits: [
      'Use 60% less energy than standard electric water heaters',
      'Qualify for $600 in combined rebates',
      'Longer lifespan (12-15 years vs 8-10 years)',
      'Track energy savings via utility bills'
    ],
    nextSteps: [
      'Check if current water heater is 8+ years old',
      'Get quotes from licensed plumbers',
      'Apply for rebates before installation',
      'Compare gas/electric bills monthly to measure savings'
    ],
    methodology: 'Water heating accounts for 18% of home energy use. Heat pump water heaters save $350/year average. Net cost after $600 rebates: $600-1,900. Payback: 2-5 years. Track monthly utility costs to verify.'
  });

  // Window Replacement
  if (property.yearBuilt < 1990) {
    opportunities.push({
      id: 'window-replacement',
      category: 'energy',
      name: 'Energy-Efficient Window Replacement',
      annualSavings: 300,
      upfrontCost: { min: 3000, max: 8000 },
      rebates: [
        { name: 'Federal Energy Efficiency Tax Credit', amount: 600, link: 'https://www.energystar.gov/about/federal_tax_credits' }
      ],
      paybackMonths: 96,
      difficulty: 'Professional',
      confidenceScore: 75,
      benefits: [
        'Reduce heating/cooling costs by 10-15%',
        'Improve home comfort and reduce drafts',
        'Qualify for $600 federal tax credit',
        'Increase home value and curb appeal'
      ],
      nextSteps: [
        'Prioritize windows with visible damage or drafts',
        'Get quotes for ENERGY STAR certified windows',
        'Consider phased approach (worst windows first)',
        'Track heating/cooling costs to measure impact'
      ],
      methodology: 'Homes built before 1990 typically have single-pane windows. Upgrading to double-pane saves $300/year. Net cost after tax credit: $2,400-7,400. Long payback but measurable comfort improvement. Track seasonal utility costs.'
    });
  }

  return opportunities;
};