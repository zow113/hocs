# Utility Lookup API Documentation

## Overview

The Utility Lookup API provides detailed information about utility providers (electric, gas, and water) and their available programs/rebates for California addresses. This service helps homeowners identify their utility providers and discover available energy efficiency programs, rebates, and incentives.

## Endpoint

### POST `/api/v1/utilities/lookup`

Identifies utility providers and their programs for a given California location.

## Request

### Headers
```
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | Yes | Property latitude coordinate |
| `longitude` | float | Yes | Property longitude coordinate |
| `city` | string | No | City name (helps with accuracy) |
| `county` | string | No | County name (helps with accuracy) |
| `state` | string | No | State code (default: "CA") |

### Example Request

```bash
curl -X POST http://localhost:8000/api/v1/utilities/lookup \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 34.1478,
    "longitude": -118.1445,
    "city": "Pasadena",
    "county": "Los Angeles",
    "state": "CA"
  }'
```

## Response

### Success Response (200 OK)

```json
{
  "utilities": {
    "electric": {
      "name": "Southern California Edison",
      "website": "https://www.sce.com",
      "programs_url": "https://www.sce.com/residential/rebates-savings",
      "rebates_url": "https://www.sce.com/residential/rebates-savings/rebates-by-product",
      "phone": "1-800-655-4555",
      "service_area": "Southern California (excluding LA City, San Diego)"
    },
    "gas": {
      "name": "Southern California Gas Company",
      "website": "https://www.socalgas.com",
      "programs_url": "https://www.socalgas.com/save-money-and-energy",
      "rebates_url": "https://www.socalgas.com/save-money-and-energy/rebates-and-incentives",
      "phone": "1-877-238-0092",
      "service_area": "Southern California"
    },
    "water": {
      "name": "Metropolitan Water District of Southern California",
      "website": "https://www.mwdh2o.com",
      "programs_url": "https://www.bewaterwise.com",
      "rebates_url": "https://www.bewaterwise.com/rebates",
      "phone": "1-800-CALL-MWD",
      "service_area": "Southern California (regional)"
    }
  },
  "programs": {
    "electric": [
      {
        "name": "Home Energy Advisor",
        "category": "energy_efficiency",
        "description": "Free online tool and personalized recommendations for energy savings",
        "rebate_amount": "Free",
        "eligibility": ["All SCE residential customers"],
        "application_url": "https://www.sce.com/residential/rebates-savings/home-energy-advisor",
        "phone": "1-800-655-4555",
        "income_qualified": false,
        "notes": null
      },
      {
        "name": "Smart Thermostat Rebate",
        "category": "hvac",
        "description": "Rebate for purchasing and installing qualifying smart thermostats",
        "rebate_amount": "$75-$120",
        "eligibility": [
          "SCE residential customers",
          "Must purchase qualifying ENERGY STAR thermostat"
        ],
        "application_url": "https://www.sce.com/residential/rebates-savings/rebates-by-product/smart-thermostat",
        "phone": "1-800-655-4555",
        "income_qualified": false,
        "notes": null
      }
    ],
    "gas": [...],
    "water": [...]
  }
}
```

### Error Response (500 Internal Server Error)

```json
{
  "detail": "Error looking up utilities: <error message>"
}
```

## Supported Utilities

### Electric Utilities
- **Southern California Edison (SCE)** - Southern California (excluding LA City, San Diego)
- **Pacific Gas and Electric (PG&E)** - Northern and Central California
- **San Diego Gas & Electric (SDG&E)** - San Diego and southern Orange County
- **Los Angeles Department of Water and Power (LADWP)** - City of Los Angeles
- **Sacramento Municipal Utility District (SMUD)** - Sacramento County

### Gas Utilities
- **Southern California Gas Company (SoCalGas)** - Southern California
- **Pacific Gas and Electric (PG&E)** - Northern and Central California
- **San Diego Gas & Electric (SDG&E)** - San Diego and southern Orange County

### Water Utilities
- **Los Angeles Department of Water and Power (LADWP)** - City of Los Angeles
- **East Bay Municipal Utility District (EBMUD)** - East Bay Area
- **San Diego County Water Authority (SDCWA)** - San Diego County
- **Metropolitan Water District (MWD)** - Southern California (regional)

## Program Categories

Programs are categorized into the following types:

- `energy_efficiency` - General energy efficiency programs and audits
- `solar` - Solar installation incentives and programs
- `water_conservation` - Water-saving programs and rebates
- `weatherization` - Insulation and weatherization assistance
- `appliance_rebate` - Rebates for energy-efficient appliances
- `hvac` - Heating, ventilation, and air conditioning programs
- `insulation` - Insulation upgrade programs

## Use Cases

### 1. Property Analysis
Use this endpoint during property lookup to provide homeowners with:
- Their specific utility providers
- Available rebates and incentives
- Contact information for each utility
- Direct links to program applications

### 2. Opportunity Enhancement
Enhance savings opportunities by:
- Showing utility-specific rebate amounts
- Providing accurate contact information
- Linking to official program pages
- Filtering programs by eligibility

### 3. Regional Customization
Customize recommendations based on:
- Local utility service areas
- Regional program availability
- Income-qualified programs
- Utility-specific incentives

## Integration Example

```typescript
// Frontend integration example
async function lookupUtilities(latitude: number, longitude: number, city: string, county: string) {
  const response = await fetch('http://localhost:8000/api/v1/utilities/lookup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latitude,
      longitude,
      city,
      county,
      state: 'CA'
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to lookup utilities');
  }
  
  const data = await response.json();
  return data;
}

// Usage
const utilities = await lookupUtilities(34.1478, -118.1445, 'Pasadena', 'Los Angeles');
console.log('Electric Provider:', utilities.utilities.electric.name);
console.log('Available Programs:', utilities.programs.electric.length);
```

## Notes

- The service uses geographic boundaries to determine utility service areas
- Some areas may have overlapping utility coverage
- Water utilities are more localized and may return `null` for some areas
- All utility information is based on publicly available data
- Program details and rebate amounts may change - always verify with the utility provider

## Related Services

- **UtilityLookupService** (`backend/services/utility_lookup_service.py`) - Core utility identification logic
- **UtilityProgramService** (`backend/services/utility_program_service.py`) - Program database and retrieval
- **OpportunityService** (`backend/services/opportunity_service.py`) - Integrates utility data into savings opportunities

## Future Enhancements

Potential improvements for this API:
- Real-time program data updates via utility APIs
- Geocoding integration for address-to-coordinates conversion
- Historical rebate tracking
- Program eligibility calculator
- Multi-state support beyond California