export interface PropertyData {
  address: string;
  yearBuilt: number;
  squareFeet: number;
  bedrooms: number;
  bathrooms: number;
  lotSize: number;
  lastSalePrice: number;
  assessedValue: number;
  propertyTaxEstimate: number;
  utilityProvider: string;
  wildfireZone: 'Low' | 'Medium' | 'High';
  roofAge: number;
  solarFeasibilityScore: number;
  permitHistory: string[];
}

export interface OfficialResource {
  name: string;
  url: string;
  type: 'government' | 'utility' | 'program';
}

export interface SavingsOpportunity {
  id: string;
  category: 'energy' | 'solar' | 'water' | 'maintenance';
  name: string;
  annualSavings: number;
  upfrontCost: { min: number; max: number };
  rebates: { name: string; amount: number; link: string }[];
  paybackMonths: number;
  difficulty: 'DIY' | 'Professional' | 'Specialist';
  confidenceScore: number;
  benefits: string[];
  nextSteps: string[];
  methodology: string;
  officialResources?: OfficialResource[];
}

export interface PrioritizedPlan {
  topOpportunities: SavingsOpportunity[];
  secondaryOpportunities: SavingsOpportunity[];
  totalAnnualSavings: number;
  customized: boolean;
}

export interface SessionData {
  propertyData: PropertyData | null;
  opportunities: SavingsOpportunity[];
  prioritizedPlan: PrioritizedPlan | null;
  timestamp: number;
}