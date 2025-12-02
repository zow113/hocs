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

  // Property Tax Appeal
  if (property.assessedValue > property.lastSalePrice * 0.9) {
    opportunities.push({
      id: 'prop-tax-1',
      category: 'property-tax',
      name: 'Property Tax Assessment Appeal',
      annualSavings: 1200,
      upfrontCost: { min: 0, max: 500 },
      rebates: [],
      paybackMonths: 5,
      difficulty: 'Professional',
      confidenceScore: 78,
      benefits: [
        'Reduce annual property tax by 15-20%',
        'One-time appeal process',
        'No upfront cost if using contingency-based service'
      ],
      nextSteps: [
        'Review recent comparable sales in your neighborhood',
        'Contact a property tax consultant for free assessment',
        'File appeal before deadline (July 2nd annually)'
      ],
      methodology: 'Based on assessed value being 15% higher than recent sale price. Average successful appeals reduce taxes by $1,200/year.'
    });
  }

  // Home Insurance Optimization
  opportunities.push({
    id: 'insurance-1',
    category: 'insurance',
    name: 'Home Insurance Policy Review',
    annualSavings: 850,
    upfrontCost: { min: 0, max: 0 },
    rebates: [],
    paybackMonths: 0,
    difficulty: 'DIY',
    confidenceScore: 92,
    benefits: [
      'Compare rates from 5+ insurers',
      'Bundle with auto insurance for additional savings',
      'Update coverage to match current needs'
    ],
    nextSteps: [
      'Get quotes from at least 3 different insurers',
      'Review current policy for unnecessary coverage',
      'Ask about discounts for security systems or fire alarms'
    ],
    methodology: 'LA County homeowners save average of $850/year by shopping insurance. Based on property value and wildfire zone.'
  });

  // Energy Efficiency - Insulation
  if (property.yearBuilt < 1980) {
    opportunities.push({
      id: 'energy-1',
      category: 'energy',
      name: 'Attic Insulation Upgrade',
      annualSavings: 420,
      upfrontCost: { min: 1200, max: 2500 },
      rebates: [
        { name: 'SoCalGas Energy Upgrade', amount: 300, link: 'https://socalgas.com/rebates' }
      ],
      paybackMonths: 32,
      difficulty: 'Professional',
      confidenceScore: 85,
      benefits: [
        'Reduce heating/cooling costs by 20-30%',
        'Improve home comfort year-round',
        'Increase home value'
      ],
      nextSteps: [
        'Schedule free home energy audit',
        'Get quotes from 3 insulation contractors',
        'Apply for SoCalGas rebate before installation'
      ],
      methodology: 'Homes built before 1980 typically have inadequate insulation. Average savings of $420/year based on 1,850 sqft home.'
    });
  }

  // Solar ROI
  if (property.solarFeasibilityScore > 70) {
    opportunities.push({
      id: 'solar-1',
      category: 'solar',
      name: 'Residential Solar Installation',
      annualSavings: 2400,
      upfrontCost: { min: 15000, max: 25000 },
      rebates: [
        { name: 'Federal Solar Tax Credit (30%)', amount: 6000, link: 'https://www.energy.gov/solar-tax-credit' },
        { name: 'CA Solar Initiative', amount: 1000, link: 'https://www.gosolarcalifornia.org' }
      ],
      paybackMonths: 72,
      difficulty: 'Specialist',
      confidenceScore: 88,
      benefits: [
        'Eliminate 80-90% of electric bills',
        '30% federal tax credit',
        'Increase home value by $20,000+'
      ],
      nextSteps: [
        'Get 3 quotes from certified solar installers',
        'Review utility bills to size system correctly',
        'Check HOA restrictions if applicable'
      ],
      methodology: 'Based on solar feasibility score of 85/100, average LA County electric bill of $200/month, and 6kW system cost.'
    });
  }

  // Water Conservation
  opportunities.push({
    id: 'water-1',
    category: 'water',
    name: 'Low-Flow Fixture Installation',
    annualSavings: 180,
    upfrontCost: { min: 200, max: 600 },
    rebates: [
      { name: 'Metropolitan Water District Rebate', amount: 150, link: 'https://bewaterwise.com/rebates' }
    ],
    paybackMonths: 15,
    difficulty: 'DIY',
    confidenceScore: 95,
    benefits: [
      'Reduce water usage by 30%',
      'Lower water and sewer bills',
      'Easy DIY installation'
    ],
    nextSteps: [
      'Purchase WaterSense certified fixtures',
      'Install low-flow showerheads and faucet aerators',
      'Apply for MWD rebate after installation'
    ],
    methodology: 'Average LA County household uses 100 gallons/day. Low-flow fixtures reduce usage by 30%, saving $180/year.'
  });

  // Maintenance - Roof
  if (property.roofAge > 15) {
    opportunities.push({
      id: 'maintenance-1',
      category: 'maintenance',
      name: 'Roof Inspection & Preventive Maintenance',
      annualSavings: 1500,
      upfrontCost: { min: 300, max: 800 },
      rebates: [],
      paybackMonths: 4,
      difficulty: 'Professional',
      confidenceScore: 82,
      benefits: [
        'Prevent costly emergency repairs',
        'Extend roof life by 5-7 years',
        'Avoid water damage to interior'
      ],
      nextSteps: [
        'Schedule professional roof inspection',
        'Address minor repairs immediately',
        'Plan for replacement in 3-5 years'
      ],
      methodology: 'Roof is 18 years old (typical lifespan 20-25 years). Preventive maintenance avoids average $15,000 emergency repair.'
    });
  }

  // LED Lighting
  opportunities.push({
    id: 'energy-2',
    category: 'energy',
    name: 'LED Lighting Conversion',
    annualSavings: 120,
    upfrontCost: { min: 150, max: 300 },
    rebates: [],
    paybackMonths: 18,
    difficulty: 'DIY',
    confidenceScore: 98,
    benefits: [
      'Reduce lighting costs by 75%',
      'Bulbs last 15-25 years',
      'Instant energy savings'
    ],
    nextSteps: [
      'Count current incandescent/CFL bulbs',
      'Purchase LED replacements in bulk',
      'Replace highest-use bulbs first'
    ],
    methodology: 'Average home has 40 bulbs. LED conversion saves $3/bulb/year in electricity costs.'
  });

  // Smart Thermostat
  opportunities.push({
    id: 'energy-3',
    category: 'energy',
    name: 'Smart Thermostat Installation',
    annualSavings: 180,
    upfrontCost: { min: 200, max: 300 },
    rebates: [
      { name: 'Utility Company Rebate', amount: 75, link: 'https://socalgas.com/smart-thermostat' }
    ],
    paybackMonths: 10,
    difficulty: 'DIY',
    confidenceScore: 90,
    benefits: [
      'Reduce HVAC costs by 10-15%',
      'Remote temperature control',
      'Learning algorithms optimize comfort'
    ],
    nextSteps: [
      'Check HVAC compatibility',
      'Purchase Nest or Ecobee thermostat',
      'Install and claim utility rebate'
    ],
    methodology: 'Smart thermostats reduce HVAC costs by average 12% for 1,850 sqft home with $1,500 annual heating/cooling costs.'
  });

  return opportunities;
};