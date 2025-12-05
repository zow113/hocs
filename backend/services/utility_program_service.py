"""
Utility Program Service for California utility providers.
Provides detailed program information, rebates, and resources for specific utilities.
"""
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum
import logging

from services.utility_lookup_service import UtilityProvider, UtilityType

logger = logging.getLogger(__name__)


class ProgramCategory(str, Enum):
    ENERGY_EFFICIENCY = "energy_efficiency"
    SOLAR = "solar"
    WATER_CONSERVATION = "water_conservation"
    WEATHERIZATION = "weatherization"
    APPLIANCE_REBATE = "appliance_rebate"
    HVAC = "hvac"
    INSULATION = "insulation"


@dataclass
class UtilityProgram:
    """Represents a utility-specific program or rebate"""
    name: str
    category: ProgramCategory
    description: str
    rebate_amount: Optional[str]  # e.g., "$300" or "$2/sqft" or "Up to $1,000"
    eligibility: List[str]
    application_url: str
    phone: Optional[str] = None
    income_qualified: bool = False
    notes: Optional[str] = None


class UtilityProgramDatabase:
    """Database of utility-specific programs and rebates"""
    
    # Southern California Edison (SCE) Programs
    SCE_PROGRAMS = [
        UtilityProgram(
            name="Home Energy Advisor",
            category=ProgramCategory.ENERGY_EFFICIENCY,
            description="Free online tool and personalized recommendations for energy savings",
            rebate_amount="Free",
            eligibility=["All SCE residential customers"],
            application_url="https://www.sce.com/residential/rebates-savings/home-energy-advisor",
            phone="1-800-655-4555"
        ),
        UtilityProgram(
            name="Smart Thermostat Rebate",
            category=ProgramCategory.HVAC,
            description="Rebate for purchasing and installing qualifying smart thermostats",
            rebate_amount="$75-$120",
            eligibility=["SCE residential customers", "Must purchase qualifying ENERGY STAR thermostat"],
            application_url="https://www.sce.com/residential/rebates-savings/rebates-by-product/smart-thermostat",
            phone="1-800-655-4555"
        ),
        UtilityProgram(
            name="Energy Savings Assistance Program",
            category=ProgramCategory.WEATHERIZATION,
            description="Free energy-saving improvements for income-qualified customers",
            rebate_amount="Free",
            eligibility=["Income at or below 200% of federal poverty guidelines"],
            application_url="https://www.sce.com/residential/assistance/energy-savings-assistance-program",
            phone="1-800-655-4555",
            income_qualified=True
        ),
        UtilityProgram(
            name="Appliance Rebates",
            category=ProgramCategory.APPLIANCE_REBATE,
            description="Rebates for energy-efficient appliances including refrigerators, washers, and pool pumps",
            rebate_amount="$50-$400",
            eligibility=["SCE residential customers", "Must purchase qualifying ENERGY STAR appliances"],
            application_url="https://www.sce.com/residential/rebates-savings/rebates-by-product",
            phone="1-800-655-4555"
        ),
    ]
    
    # Pacific Gas & Electric (PG&E) Programs
    PGE_PROGRAMS = [
        UtilityProgram(
            name="Home Energy Checkup",
            category=ProgramCategory.ENERGY_EFFICIENCY,
            description="Free in-home energy assessment with instant savings measures",
            rebate_amount="Free",
            eligibility=["All PG&E residential customers"],
            application_url="https://www.pge.com/en_US/residential/save-energy-money/savings-solutions-and-rebates/home-energy-checkup/home-energy-checkup.page",
            phone="1-800-743-5000"
        ),
        UtilityProgram(
            name="Energy Efficiency Rebates",
            category=ProgramCategory.APPLIANCE_REBATE,
            description="Rebates for energy-efficient appliances, HVAC, and water heaters",
            rebate_amount="$50-$6,000",
            eligibility=["PG&E residential customers", "Varies by product"],
            application_url="https://www.pge.com/en_US/residential/save-energy-money/savings-solutions-and-rebates/rebates-and-incentives/rebates-and-incentives.page",
            phone="1-800-743-5000"
        ),
        UtilityProgram(
            name="Energy Savings Assistance Program",
            category=ProgramCategory.WEATHERIZATION,
            description="Free weatherization and energy efficiency upgrades for income-qualified households",
            rebate_amount="Free",
            eligibility=["Income at or below 200% of federal poverty guidelines"],
            application_url="https://www.pge.com/en_US/residential/save-energy-money/help-paying-your-bill/longer-term-assistance/energy-savings-assistance-program/energy-savings-assistance-program.page",
            phone="1-866-743-2752",
            income_qualified=True
        ),
    ]
    
    # San Diego Gas & Electric (SDG&E) Programs
    SDGE_PROGRAMS = [
        UtilityProgram(
            name="Home Energy Savings Program",
            category=ProgramCategory.ENERGY_EFFICIENCY,
            description="Free home energy assessment and instant savings measures",
            rebate_amount="Free",
            eligibility=["All SDG&E residential customers"],
            application_url="https://www.sdge.com/residential/savings-center/energy-management-programs/home-energy-savings-program",
            phone="1-800-411-7343"
        ),
        UtilityProgram(
            name="Appliance Rebates",
            category=ProgramCategory.APPLIANCE_REBATE,
            description="Rebates for ENERGY STAR appliances and equipment",
            rebate_amount="$50-$3,000",
            eligibility=["SDG&E residential customers", "Must purchase qualifying products"],
            application_url="https://www.sdge.com/residential/savings-center/rebates-incentives",
            phone="1-800-411-7343"
        ),
        UtilityProgram(
            name="Energy Savings Assistance Program",
            category=ProgramCategory.WEATHERIZATION,
            description="Free energy efficiency improvements for income-qualified customers",
            rebate_amount="Free",
            eligibility=["Income at or below 200% of federal poverty guidelines"],
            application_url="https://www.sdge.com/residential/savings-center/energy-assistance-programs/energy-savings-assistance-program",
            phone="1-877-646-5525",
            income_qualified=True
        ),
    ]
    
    # Los Angeles Department of Water and Power (LADWP) Programs
    LADWP_PROGRAMS = [
        UtilityProgram(
            name="Refrigerator Exchange Program",
            category=ProgramCategory.APPLIANCE_REBATE,
            description="Free pickup and recycling of old refrigerator plus $50 incentive",
            rebate_amount="$50",
            eligibility=["LADWP residential customers", "Working refrigerator 10+ years old"],
            application_url="https://www.ladwp.com/ladwp/faces/ladwp/residential/r-savemoney/r-sm-rebatesandprograms/r-sm-rp-appliancerecycling",
            phone="1-800-246-0441"
        ),
        UtilityProgram(
            name="Residential Lighting Rebate",
            category=ProgramCategory.ENERGY_EFFICIENCY,
            description="Rebates for LED bulbs and fixtures",
            rebate_amount="Varies",
            eligibility=["LADWP residential customers"],
            application_url="https://www.ladwp.com/ladwp/faces/ladwp/residential/r-savemoney/r-sm-rebatesandprograms",
            phone="1-800-342-5397"
        ),
        UtilityProgram(
            name="Turf Replacement Program",
            category=ProgramCategory.WATER_CONSERVATION,
            description="Rebate for replacing grass with water-efficient landscaping",
            rebate_amount="$3 per square foot",
            eligibility=["LADWP water customers", "Minimum 500 sqft removal"],
            application_url="https://www.ladwp.com/ladwp/faces/ladwp/residential/r-savemoney/r-sm-watersavingprograms/r-sm-wsp-turfreplacement",
            phone="1-800-544-4498"
        ),
        UtilityProgram(
            name="Energy Efficiency Assistance Program",
            category=ProgramCategory.WEATHERIZATION,
            description="Free weatherization and energy efficiency upgrades for income-qualified customers",
            rebate_amount="Free",
            eligibility=["Income at or below 200% of federal poverty guidelines"],
            application_url="https://www.ladwp.com/ladwp/faces/ladwp/residential/r-savemoney/r-sm-rebatesandprograms",
            phone="1-800-342-5397",
            income_qualified=True
        ),
    ]
    
    # Southern California Gas Company (SoCalGas) Programs
    SOCALGAS_PROGRAMS = [
        UtilityProgram(
            name="Energy Savings Assistance Program",
            category=ProgramCategory.WEATHERIZATION,
            description="Free energy-saving improvements for income-qualified customers",
            rebate_amount="Free",
            eligibility=["Income at or below 200% of federal poverty guidelines"],
            application_url="https://www.socalgas.com/save-money-and-energy/assistance-programs/energy-savings-assistance-program",
            phone="1-800-331-7593",
            income_qualified=True
        ),
        UtilityProgram(
            name="Water Heater Rebate",
            category=ProgramCategory.APPLIANCE_REBATE,
            description="Rebates for high-efficiency water heaters",
            rebate_amount="$300-$1,800",
            eligibility=["SoCalGas residential customers", "Must install qualifying equipment"],
            application_url="https://www.socalgas.com/save-money-and-energy/rebates-and-incentives/water-heating",
            phone="1-877-238-0092"
        ),
        UtilityProgram(
            name="Furnace Rebate",
            category=ProgramCategory.HVAC,
            description="Rebates for high-efficiency furnaces",
            rebate_amount="$300-$800",
            eligibility=["SoCalGas residential customers", "Must install qualifying ENERGY STAR furnace"],
            application_url="https://www.socalgas.com/save-money-and-energy/rebates-and-incentives/heating-and-cooling",
            phone="1-877-238-0092"
        ),
    ]
    
    # Sacramento Municipal Utility District (SMUD) Programs
    SMUD_PROGRAMS = [
        UtilityProgram(
            name="Home Performance Program",
            category=ProgramCategory.ENERGY_EFFICIENCY,
            description="Comprehensive home energy assessment and rebates for improvements",
            rebate_amount="Up to $4,500",
            eligibility=["SMUD residential customers"],
            application_url="https://www.smud.org/en/Rate-Information/Residential-rates/Rebates-and-programs/Home-Performance-Program",
            phone="1-888-742-7683"
        ),
        UtilityProgram(
            name="Appliance Rebates",
            category=ProgramCategory.APPLIANCE_REBATE,
            description="Rebates for energy-efficient appliances",
            rebate_amount="$50-$300",
            eligibility=["SMUD residential customers", "Must purchase qualifying appliances"],
            application_url="https://www.smud.org/en/Rate-Information/Residential-rates/Rebates-and-programs",
            phone="1-888-742-7683"
        ),
    ]
    
    # Metropolitan Water District (MWD) Programs
    MWD_PROGRAMS = [
        UtilityProgram(
            name="Turf Replacement Program",
            category=ProgramCategory.WATER_CONSERVATION,
            description="Rebate for replacing grass with water-efficient landscaping",
            rebate_amount="$2 per square foot",
            eligibility=["MWD member agency customers", "Minimum 500 sqft removal"],
            application_url="https://www.bewaterwise.com/turf-replacement",
            phone="1-800-CALL-MWD"
        ),
        UtilityProgram(
            name="Water Conservation Devices",
            category=ProgramCategory.WATER_CONSERVATION,
            description="Rebates for water-efficient devices and fixtures",
            rebate_amount="Varies",
            eligibility=["MWD member agency customers"],
            application_url="https://www.bewaterwise.com/rebates",
            phone="1-800-CALL-MWD"
        ),
    ]


class UtilityProgramService:
    """Service to retrieve utility-specific programs and rebates"""
    
    def __init__(self):
        self.db = UtilityProgramDatabase()
    
    def get_programs_for_utility(self, utility_provider: UtilityProvider) -> List[UtilityProgram]:
        """
        Get all programs available from a specific utility provider.
        
        Args:
            utility_provider: The utility provider to get programs for
        
        Returns:
            List of UtilityProgram objects
        """
        utility_name = utility_provider.name.lower()
        
        # Map utility names to program lists
        if "southern california edison" in utility_name or "sce" in utility_name:
            return self.db.SCE_PROGRAMS
        elif "pacific gas and electric" in utility_name or "pg&e" in utility_name or "pge" in utility_name:
            return self.db.PGE_PROGRAMS
        elif "san diego gas" in utility_name or "sdg&e" in utility_name:
            return self.db.SDGE_PROGRAMS
        elif "los angeles department of water and power" in utility_name or "ladwp" in utility_name:
            return self.db.LADWP_PROGRAMS
        elif "southern california gas" in utility_name or "socalgas" in utility_name:
            return self.db.SOCALGAS_PROGRAMS
        elif "sacramento municipal" in utility_name or "smud" in utility_name:
            return self.db.SMUD_PROGRAMS
        elif "metropolitan water district" in utility_name or "mwd" in utility_name:
            return self.db.MWD_PROGRAMS
        else:
            logger.warning(f"No programs found for utility: {utility_name}")
            return []
    
    def get_programs_by_category(
        self,
        utility_provider: UtilityProvider,
        category: ProgramCategory
    ) -> List[UtilityProgram]:
        """
        Get programs from a utility filtered by category.
        
        Args:
            utility_provider: The utility provider
            category: The program category to filter by
        
        Returns:
            List of UtilityProgram objects matching the category
        """
        all_programs = self.get_programs_for_utility(utility_provider)
        return [p for p in all_programs if p.category == category]
    
    def get_all_programs_for_address(
        self,
        utilities: Dict[str, Optional[UtilityProvider]]
    ) -> Dict[str, List[UtilityProgram]]:
        """
        Get all programs available for an address based on its utilities.
        
        Args:
            utilities: Dictionary of utility types to providers (from UtilityLookupService)
        
        Returns:
            Dictionary mapping utility type to list of programs
        """
        result = {}
        
        for utility_type, provider in utilities.items():
            if provider:
                programs = self.get_programs_for_utility(provider)
                result[utility_type] = programs
            else:
                result[utility_type] = []
        
        return result
    
    def format_programs_for_api(self, programs: List[UtilityProgram]) -> List[Dict]:
        """Convert UtilityProgram objects to dictionary format for API response"""
        return [
            {
                "name": p.name,
                "category": p.category.value,
                "description": p.description,
                "rebate_amount": p.rebate_amount,
                "eligibility": p.eligibility,
                "application_url": p.application_url,
                "phone": p.phone,
                "income_qualified": p.income_qualified,
                "notes": p.notes
            }
            for p in programs
        ]