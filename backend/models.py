from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime
from uuid import UUID, uuid4


class OfficialResource(BaseModel):
    """Official resource link for savings opportunities"""
    name: str
    url: str
    type: Literal['government', 'utility', 'program']


class Rebate(BaseModel):
    """Rebate information for savings opportunities"""
    name: str
    amount: float
    link: str


class UpfrontCost(BaseModel):
    """Upfront cost range for savings opportunities"""
    min: float
    max: float


class SavingsOpportunity(BaseModel):
    """Savings opportunity model matching TypeScript interface"""
    id: str
    category: Literal['energy', 'solar', 'water', 'maintenance']
    name: str
    annualSavings: float = Field(alias='annualSavings')
    upfrontCost: UpfrontCost = Field(alias='upfrontCost')
    rebates: List[Rebate]
    paybackMonths: float = Field(alias='paybackMonths')
    difficulty: Literal['DIY', 'Professional', 'Specialist']
    confidenceScore: float = Field(alias='confidenceScore')
    benefits: List[str]
    nextSteps: List[str] = Field(alias='nextSteps')
    methodology: str
    officialResources: Optional[List[OfficialResource]] = Field(default=None, alias='officialResources')

    class Config:
        populate_by_name = True


class PropertyData(BaseModel):
    """Property data model matching TypeScript interface"""
    address: str
    yearBuilt: int = Field(alias='yearBuilt')
    squareFeet: int = Field(alias='squareFeet')
    bedrooms: int
    bathrooms: int
    lotSize: int = Field(alias='lotSize')
    lastSalePrice: float = Field(alias='lastSalePrice')
    assessedValue: float = Field(alias='assessedValue')
    propertyTaxEstimate: float = Field(alias='propertyTaxEstimate')
    utilityProvider: str = Field(alias='utilityProvider')  # Kept for backward compatibility
    electricProvider: Optional[str] = Field(default=None, alias='electricProvider')
    gasProvider: Optional[str] = Field(default=None, alias='gasProvider')
    waterProvider: Optional[str] = Field(default=None, alias='waterProvider')
    wildfireZone: Literal['Low', 'Medium', 'High'] = Field(alias='wildfireZone')
    roofAge: int = Field(alias='roofAge')
    solarFeasibilityScore: float = Field(alias='solarFeasibilityScore')
    permitHistory: List[str] = Field(alias='permitHistory')

    class Config:
        populate_by_name = True
        by_alias = True  # Serialize using aliases (camelCase)


class Address(BaseModel):
    """Address model for autocomplete"""
    address: str


class Session(BaseModel):
    """Session model for storing property lookup results"""
    session_id: str = Field(default_factory=lambda: str(uuid4()), alias='session_id')
    property_data: PropertyData = Field(alias='property_data')
    opportunities: List[SavingsOpportunity]
    created_at: datetime = Field(default_factory=datetime.utcnow, alias='created_at')
    expires_at: datetime = Field(alias='expires_at')

    class Config:
        populate_by_name = True


class PropertyLookupRequest(BaseModel):
    """Request model for property lookup"""
    address: str


class PropertyLookupResponse(BaseModel):
    """Response model for property lookup"""
    property: PropertyData
    opportunities: List[SavingsOpportunity]
    session_id: str = Field(alias='session_id')

    class Config:
        populate_by_name = True