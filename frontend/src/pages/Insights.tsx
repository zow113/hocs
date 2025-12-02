import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Home, AlertTriangle, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProperty } from '@/context/PropertyContext';

const Insights = () => {
  const navigate = useNavigate();
  const { propertyData, resetSession } = useProperty();

  useEffect(() => {
    if (!propertyData) {
      navigate('/');
    }
  }, [propertyData, navigate]);

  if (!propertyData) return null;

  const getRiskColor = (zone: string) => {
    switch (zone) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">HOCS</h1>
            </div>
            <Button variant="outline" onClick={resetSession}>
              New Search
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Property Address Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{propertyData.address}</h2>
          <p className="text-gray-600">Property Insights & Analysis</p>
        </div>

        {/* Property Details Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Year Built</span>
                <span className="font-semibold">{propertyData.yearBuilt}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Square Feet</span>
                <span className="font-semibold">{propertyData.squareFeet.toLocaleString()} sqft</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Bedrooms</span>
                <span className="font-semibold">{propertyData.bedrooms}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Bathrooms</span>
                <span className="font-semibold">{propertyData.bathrooms}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Lot Size</span>
                <span className="font-semibold">{propertyData.lotSize.toLocaleString()} sqft</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Sale Price</span>
                <span className="font-semibold">{formatCurrency(propertyData.lastSalePrice)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-gray-600 flex items-center cursor-help">
                        Assessed Value
                        <Info className="w-3 h-3 ml-1" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Current assessed value for property tax calculation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-semibold">{formatCurrency(propertyData.assessedValue)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-gray-600 flex items-center cursor-help">
                        Annual Property Tax
                        <Info className="w-3 h-3 ml-1" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Estimated annual property tax (1.2% of assessed value)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-semibold">{formatCurrency(propertyData.propertyTaxEstimate)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Factors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Wildfire Zone</span>
                <Badge className={getRiskColor(propertyData.wildfireZone)}>
                  {propertyData.wildfireZone}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-gray-600 flex items-center cursor-help">
                        Roof Age
                        <Info className="w-3 h-3 ml-1" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Estimated age based on permit records</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-semibold">{propertyData.roofAge} years</span>
              </div>
              {propertyData.roofAge > 15 && (
                <>
                  <Separator />
                  <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Roof may need replacement soon (typical lifespan: 20-25 years)
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Utility & Solar Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Utility Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Utility Provider</span>
                <span className="font-semibold">{propertyData.utilityProvider}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Solar Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Feasibility Score</span>
                <span className="text-2xl font-bold text-green-600">{propertyData.solarFeasibilityScore}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${propertyData.solarFeasibilityScore}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {propertyData.solarFeasibilityScore > 70 ? 'Excellent' : 'Good'} solar potential based on roof orientation, shading, and local climate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Permit History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Recent Permit History</CardTitle>
          </CardHeader>
          <CardContent>
            {propertyData.permitHistory.length > 0 ? (
              <ul className="space-y-2">
                {propertyData.permitHistory.map((permit, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                    {permit}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent permit records found</p>
            )}
          </CardContent>
        </Card>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/diagnostic')}
            className="px-8"
          >
            Next: See How Much You Can Save
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Insights;