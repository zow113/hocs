"""
Utility Lookup Service for California addresses.
Identifies electric, gas, and water providers based on address location.
"""
from typing import Dict, Optional
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class UtilityType(str, Enum):
    ELECTRIC = "electric"
    GAS = "gas"
    WATER = "water"


@dataclass
class UtilityProvider:
    """Represents a utility provider"""
    name: str
    utility_type: UtilityType
    service_area: str
    website: str
    programs_url: Optional[str] = None
    rebates_url: Optional[str] = None
    phone: Optional[str] = None


class CaliforniaUtilityDatabase:
    """Database of California utility providers and their service areas"""
    
    # Major Electric Utilities in California
    ELECTRIC_UTILITIES = {
        "SCE": UtilityProvider(
            name="Southern California Edison",
            utility_type=UtilityType.ELECTRIC,
            service_area="Southern California (excluding LA City, San Diego, includes Irvine)",
            website="https://www.sce.com",
            programs_url="https://www.sce.com/residential/rebates-savings",
            rebates_url="https://www.sce.com/residential/rebates-savings/rebates-by-product",
            phone="1-800-655-4555"
        ),
        "PGE": UtilityProvider(
            name="Pacific Gas and Electric",
            utility_type=UtilityType.ELECTRIC,
            service_area="Northern and Central California",
            website="https://www.pge.com",
            programs_url="https://www.pge.com/en_US/residential/save-energy-money/savings-solutions-and-rebates/savings-solutions-and-rebates.page",
            rebates_url="https://www.pge.com/en_US/residential/save-energy-money/savings-solutions-and-rebates/rebates-and-incentives/rebates-and-incentives.page",
            phone="1-800-743-5000"
        ),
        "SDGE": UtilityProvider(
            name="San Diego Gas & Electric",
            utility_type=UtilityType.ELECTRIC,
            service_area="San Diego and southern Orange County",
            website="https://www.sdge.com",
            programs_url="https://www.sdge.com/residential/savings-center",
            rebates_url="https://www.sdge.com/residential/savings-center/rebates-incentives",
            phone="1-800-411-7343"
        ),
        "LADWP": UtilityProvider(
            name="Los Angeles Department of Water and Power",
            utility_type=UtilityType.ELECTRIC,
            service_area="City of Los Angeles",
            website="https://www.ladwp.com",
            programs_url="https://www.ladwp.com/ladwp/faces/ladwp/residential/r-savemoney",
            rebates_url="https://www.ladwp.com/ladwp/faces/ladwp/residential/r-savemoney/r-sm-rebatesandprograms",
            phone="1-800-342-5397"
        ),
        "SMUD": UtilityProvider(
            name="Sacramento Municipal Utility District",
            utility_type=UtilityType.ELECTRIC,
            service_area="Sacramento County",
            website="https://www.smud.org",
            programs_url="https://www.smud.org/en/Rate-Information/Residential-rates/Rebates-and-programs",
            rebates_url="https://www.smud.org/en/Rate-Information/Residential-rates/Rebates-and-programs",
            phone="1-888-742-7683"
        ),
    }
    
    # Major Gas Utilities in California
    GAS_UTILITIES = {
        "SOCALGAS": UtilityProvider(
            name="Southern California Gas Company",
            utility_type=UtilityType.GAS,
            service_area="Southern California",
            website="https://www.socalgas.com",
            programs_url="https://www.socalgas.com/save-money-and-energy",
            rebates_url="https://www.socalgas.com/save-money-and-energy/rebates-and-incentives",
            phone="1-877-238-0092"
        ),
        "PGE_GAS": UtilityProvider(
            name="Pacific Gas and Electric",
            utility_type=UtilityType.GAS,
            service_area="Northern and Central California",
            website="https://www.pge.com",
            programs_url="https://www.pge.com/en_US/residential/save-energy-money/savings-solutions-and-rebates/savings-solutions-and-rebates.page",
            rebates_url="https://www.pge.com/en_US/residential/save-energy-money/savings-solutions-and-rebates/rebates-and-incentives/rebates-and-incentives.page",
            phone="1-800-743-5000"
        ),
        "SDGE_GAS": UtilityProvider(
            name="San Diego Gas & Electric",
            utility_type=UtilityType.GAS,
            service_area="San Diego and southern Orange County",
            website="https://www.sdge.com",
            programs_url="https://www.sdge.com/residential/savings-center",
            rebates_url="https://www.sdge.com/residential/savings-center/rebates-incentives",
            phone="1-800-411-7343"
        ),
    }
    
    # Water utilities are more localized - these are major ones
    WATER_UTILITIES = {
        "IRWD": UtilityProvider(
            name="Irvine Ranch Water District",
            utility_type=UtilityType.WATER,
            service_area="Irvine and surrounding areas",
            website="https://www.irwd.com",
            programs_url="https://www.irwd.com/save-water-money",
            rebates_url="https://www.irwd.com/save-water-money/rebates",
            phone="1-949-453-5300"
        ),
        "LADWP_WATER": UtilityProvider(
            name="Los Angeles Department of Water and Power",
            utility_type=UtilityType.WATER,
            service_area="City of Los Angeles",
            website="https://www.ladwp.com",
            programs_url="https://www.ladwp.com/ladwp/faces/ladwp/residential/r-savemoney/r-sm-watersavingprograms",
            rebates_url="https://www.ladwp.com/ladwp/faces/ladwp/residential/r-savemoney/r-sm-rebatesandprograms",
            phone="1-800-342-5397"
        ),
        "EBMUD": UtilityProvider(
            name="East Bay Municipal Utility District",
            utility_type=UtilityType.WATER,
            service_area="East Bay Area",
            website="https://www.ebmud.com",
            programs_url="https://www.ebmud.com/water/conservation-and-rebates/",
            rebates_url="https://www.ebmud.com/water/conservation-and-rebates/residential-rebates/",
            phone="1-866-403-2683"
        ),
        "SDCWA": UtilityProvider(
            name="San Diego County Water Authority",
            utility_type=UtilityType.WATER,
            service_area="San Diego County",
            website="https://www.sdcwa.org",
            programs_url="https://www.sdcwa.org/conservation",
            rebates_url="https://www.sdcwa.org/conservation-rebates",
            phone="1-858-522-6700"
        ),
        "MWD": UtilityProvider(
            name="Metropolitan Water District of Southern California",
            utility_type=UtilityType.WATER,
            service_area="Southern California (regional)",
            website="https://www.mwdh2o.com",
            programs_url="https://www.bewaterwise.com",
            rebates_url="https://www.bewaterwise.com/rebates",
            phone="1-800-CALL-MWD"
        ),
    }
    
    # Geographic boundaries for utility service areas (approximate)
    # Format: (min_lat, max_lat, min_lon, max_lon)
    SERVICE_AREA_BOUNDARIES = {
        # Electric utilities
        "LADWP": (33.7, 34.35, -118.67, -118.15),  # LA City
        "SCE": (33.0, 35.5, -119.5, -117.0),  # Southern CA (broad area)
        "SDGE": (32.5, 33.5, -117.5, -116.5),  # San Diego area
        "PGE": (36.0, 42.0, -124.0, -119.0),  # Northern/Central CA
        "SMUD": (38.3, 38.8, -121.6, -121.0),  # Sacramento area
        
        # Gas utilities (similar to electric in many cases)
        "SOCALGAS": (33.0, 35.5, -119.5, -117.0),  # Southern CA
        "PGE_GAS": (36.0, 42.0, -124.0, -119.0),  # Northern/Central CA
        "SDGE_GAS": (32.5, 33.5, -117.5, -116.5),  # San Diego area
        
        # Water utilities
        "IRWD": (33.6, 33.8, -117.9, -117.7),  # Irvine area
        "LADWP_WATER": (33.7, 34.35, -118.67, -118.15),  # LA City
        "EBMUD": (37.7, 38.0, -122.4, -121.8),  # East Bay
        "SDCWA": (32.5, 33.5, -117.5, -116.5),  # San Diego County
        "MWD": (33.0, 34.5, -119.0, -117.0),  # Southern CA (regional)
    }


class UtilityLookupService:
    """Service to identify utility providers for a given address"""
    
    def __init__(self):
        self.db = CaliforniaUtilityDatabase()
    
    def _is_in_service_area(self, lat: float, lon: float, utility_code: str) -> bool:
        """Check if coordinates fall within a utility's service area"""
        if utility_code not in self.db.SERVICE_AREA_BOUNDARIES:
            return False
        
        min_lat, max_lat, min_lon, max_lon = self.db.SERVICE_AREA_BOUNDARIES[utility_code]
        return min_lat <= lat <= max_lat and min_lon <= lon <= max_lon
    
    def _detect_electric_utility(self, lat: float, lon: float, city: str, county: str) -> Optional[UtilityProvider]:
        """Detect electric utility based on location"""
        city_lower = city.lower()
        county_lower = county.lower()
        
        # Check LADWP first (LA City)
        if "los angeles" in city_lower and self._is_in_service_area(lat, lon, "LADWP"):
            return self.db.ELECTRIC_UTILITIES["LADWP"]
        
        # Check SMUD (Sacramento)
        if "sacramento" in city_lower or "sacramento" in county_lower:
            if self._is_in_service_area(lat, lon, "SMUD"):
                return self.db.ELECTRIC_UTILITIES["SMUD"]
        
        # Check SDGE (San Diego)
        if "san diego" in county_lower or "san diego" in city_lower:
            if self._is_in_service_area(lat, lon, "SDGE"):
                return self.db.ELECTRIC_UTILITIES["SDGE"]
        
        # Check PGE (Northern/Central CA)
        if self._is_in_service_area(lat, lon, "PGE"):
            return self.db.ELECTRIC_UTILITIES["PGE"]
        
        # Check SCE (Southern CA - default for southern areas)
        if self._is_in_service_area(lat, lon, "SCE"):
            return self.db.ELECTRIC_UTILITIES["SCE"]
        
        # Default to SCE for Southern CA, PGE for Northern CA
        if lat < 36.0:
            return self.db.ELECTRIC_UTILITIES["SCE"]
        else:
            return self.db.ELECTRIC_UTILITIES["PGE"]
    
    def _detect_gas_utility(self, lat: float, lon: float, city: str, county: str) -> Optional[UtilityProvider]:
        """Detect gas utility based on location"""
        city_lower = city.lower()
        county_lower = county.lower()
        
        # Check SDGE (San Diego)
        if "san diego" in county_lower or "san diego" in city_lower:
            if self._is_in_service_area(lat, lon, "SDGE_GAS"):
                return self.db.GAS_UTILITIES["SDGE_GAS"]
        
        # Check PGE (Northern/Central CA)
        if self._is_in_service_area(lat, lon, "PGE_GAS"):
            return self.db.GAS_UTILITIES["PGE_GAS"]
        
        # Check SoCalGas (Southern CA)
        if self._is_in_service_area(lat, lon, "SOCALGAS"):
            return self.db.GAS_UTILITIES["SOCALGAS"]
        
        # Default based on latitude
        if lat < 36.0:
            return self.db.GAS_UTILITIES["SOCALGAS"]
        else:
            return self.db.GAS_UTILITIES["PGE_GAS"]
    
    def _detect_water_utility(self, lat: float, lon: float, city: str, county: str) -> Optional[UtilityProvider]:
        """Detect water utility based on location"""
        city_lower = city.lower()
        county_lower = county.lower()
        
        # Check Irvine Ranch Water District
        if "irvine" in city_lower and self._is_in_service_area(lat, lon, "IRWD"):
            return self.db.WATER_UTILITIES["IRWD"]
        
        # Check LADWP (LA City)
        if "los angeles" in city_lower and self._is_in_service_area(lat, lon, "LADWP_WATER"):
            return self.db.WATER_UTILITIES["LADWP_WATER"]
        
        # Check EBMUD (East Bay)
        if any(city_name in city_lower for city_name in ["oakland", "berkeley", "richmond"]):
            if self._is_in_service_area(lat, lon, "EBMUD"):
                return self.db.WATER_UTILITIES["EBMUD"]
        
        # Check San Diego County Water Authority
        if "san diego" in county_lower:
            if self._is_in_service_area(lat, lon, "SDCWA"):
                return self.db.WATER_UTILITIES["SDCWA"]
        
        # Check MWD (Southern California regional)
        if self._is_in_service_area(lat, lon, "MWD"):
            return self.db.WATER_UTILITIES["MWD"]
        
        # Water utilities are very localized, return None if no match
        return None
    
    def lookup_utilities(
        self,
        latitude: float,
        longitude: float,
        city: str = "",
        county: str = "",
        state: str = ""
    ) -> Dict[str, Optional[UtilityProvider]]:
        """
        Look up utility providers for a given address.
        
        Args:
            latitude: Property latitude
            longitude: Property longitude
            city: City name
            county: County name
            state: State (should be California)
        
        Returns:
            Dictionary with electric, gas, and water utility providers
        """
        if state.lower() not in ["california", "ca", ""]:
            logger.warning(f"Utility lookup only supports California addresses. Got: {state}")
            return {
                "electric": None,
                "gas": None,
                "water": None
            }
        
        try:
            electric = self._detect_electric_utility(latitude, longitude, city, county)
            gas = self._detect_gas_utility(latitude, longitude, city, county)
            water = self._detect_water_utility(latitude, longitude, city, county)
            
            logger.info(f"Utilities found for {city}, {county}: Electric={electric.name if electric else 'None'}, "
                       f"Gas={gas.name if gas else 'None'}, Water={water.name if water else 'None'}")
            
            return {
                "electric": electric,
                "gas": gas,
                "water": water
            }
        except Exception as e:
            logger.error(f"Error looking up utilities: {str(e)}")
            return {
                "electric": None,
                "gas": None,
                "water": None
            }
    
    def get_utility_info(self, utilities: Dict[str, Optional[UtilityProvider]]) -> Dict:
        """Convert utility providers to dictionary format for API response"""
        result = {}
        
        for utility_type, provider in utilities.items():
            if provider:
                result[utility_type] = {
                    "name": provider.name,
                    "website": provider.website,
                    "programs_url": provider.programs_url,
                    "rebates_url": provider.rebates_url,
                    "phone": provider.phone,
                    "service_area": provider.service_area
                }
            else:
                result[utility_type] = None
        
        return result