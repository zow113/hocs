import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Home, Filter, DollarSign, TrendingUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useProperty } from '@/context/PropertyContext';
import { SavingsOpportunity } from '@/types/property';

const categoryIcons: Record<string, string> = {
  'property-tax': '🏛️',
  'insurance': '🛡️',
  'energy': '⚡',
  'solar': '☀️',
  'water': '💧',
  'maintenance': '🔧'
};

const categoryNames: Record<string, string> = {
  'property-tax': 'Property Tax',
  'insurance': 'Home Insurance',
  'energy': 'Energy Efficiency',
  'solar': 'Solar ROI',
  'water': 'Water Conservation',
  'maintenance': 'Maintenance Prevention'
};

const Diagnostic = () => {
  const navigate = useNavigate();
  const { propertyData, opportunities, resetSession } = useProperty();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'savings' | 'cost' | 'payback'>('savings');

  useEffect(() => {
    if (!propertyData || opportunities.length === 0) {
      navigate('/');
    }
  }, [propertyData, opportunities, navigate]);

  if (!propertyData || opportunities.length === 0) return null;

  const filteredOpportunities = selectedCategory === 'all'
    ? opportunities
    : opportunities.filter(opp => opp.category === selectedCategory);

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    switch (sortBy) {
      case 'savings':
        return b.annualSavings - a.annualSavings;
      case 'cost':
        return a.upfrontCost.min - b.upfrontCost.min;
      case 'payback':
        return a.paybackMonths - b.paybackMonths;
      default:
        return 0;
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const categories = Array.from(new Set(opportunities.map(opp => opp.category)));

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
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Savings Diagnostic</h2>
          <p className="text-gray-600">{propertyData.address}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Opportunities</p>
                  <p className="text-3xl font-bold text-gray-900">{opportunities.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Potential Annual Savings</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(opportunities.reduce((sum, opp) => sum + opp.annualSavings, 0))}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Categories Analyzed</p>
                  <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Filter className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryNames[cat]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="savings">Annual Savings</option>
              <option value="cost">Upfront Cost</option>
              <option value="payback">Payback Period</option>
            </select>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4 mb-8">
          {sortedOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <Collapsible>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{categoryIcons[opportunity.category]}</span>
                        <Badge variant="outline">{categoryNames[opportunity.category]}</Badge>
                        <Badge className={getConfidenceColor(opportunity.confidenceScore)}>
                          {opportunity.confidenceScore}% confidence
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{opportunity.name}</CardTitle>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Annual Savings</p>
                          <p className="font-bold text-green-600 text-lg">
                            {formatCurrency(opportunity.annualSavings)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Upfront Cost</p>
                          <p className="font-semibold">
                            {formatCurrency(opportunity.upfrontCost.min)} - {formatCurrency(opportunity.upfrontCost.max)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Payback Period</p>
                          <p className="font-semibold">
                            {Math.floor(opportunity.paybackMonths / 12)} years {opportunity.paybackMonths % 12} months
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Difficulty</p>
                          <Badge variant="secondary">{opportunity.difficulty}</Badge>
                        </div>
                      </div>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Info className="w-4 h-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Tabs defaultValue="benefits" className="w-full">
                      <TabsList>
                        <TabsTrigger value="benefits">Benefits</TabsTrigger>
                        <TabsTrigger value="steps">Next Steps</TabsTrigger>
                        <TabsTrigger value="rebates">Rebates</TabsTrigger>
                        <TabsTrigger value="methodology">How We Calculated</TabsTrigger>
                      </TabsList>

                      <TabsContent value="benefits" className="space-y-2">
                        <ul className="list-disc list-inside space-y-1">
                          {opportunity.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-gray-700">{benefit}</li>
                          ))}
                        </ul>
                      </TabsContent>

                      <TabsContent value="steps" className="space-y-2">
                        <ol className="list-decimal list-inside space-y-2">
                          {opportunity.nextSteps.map((step, idx) => (
                            <li key={idx} className="text-gray-700">{step}</li>
                          ))}
                        </ol>
                      </TabsContent>

                      <TabsContent value="rebates">
                        {opportunity.rebates.length > 0 ? (
                          <div className="space-y-3">
                            {opportunity.rebates.map((rebate, idx) => (
                              <div key={idx} className="p-3 bg-green-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="font-semibold text-gray-900">{rebate.name}</p>
                                  <p className="font-bold text-green-600">{formatCurrency(rebate.amount)}</p>
                                </div>
                                <a
                                  href={rebate.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  Learn more & apply →
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No rebates currently available for this opportunity</p>
                        )}
                      </TabsContent>

                      <TabsContent value="methodology">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 text-sm">{opportunity.methodology}</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/plan')}
            className="px-8"
          >
            Show Me My Prioritized Plan
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;