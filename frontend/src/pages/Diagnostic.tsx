import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Home, DollarSign, TrendingUp, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useProperty } from '@/context/PropertyContext';
import { SavingsOpportunity } from '@/types/property';

const categoryIcons: Record<string, string> = {
  'energy': '⚡',
  'solar': '☀️',
  'water': '💧',
  'maintenance': '🔧'
};

const categoryNames: Record<string, string> = {
  'energy': 'Energy Efficiency',
  'solar': 'Solar & Renewable',
  'water': 'Water Conservation',
  'maintenance': 'Maintenance & Upgrades'
};

const Diagnostic = () => {
  const navigate = useNavigate();
  const { propertyData, opportunities, resetSession } = useProperty();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCostTier, setSelectedCostTier] = useState<string>('all');

  useEffect(() => {
    if (!propertyData || opportunities.length === 0) {
      navigate('/');
    }
  }, [propertyData, opportunities, navigate]);

  if (!propertyData || opportunities.length === 0) return null;

  // Organize by cost tiers
  const noCostOpps = opportunities.filter(opp => opp.upfrontCost.max === 0);
  const lowCostOpps = opportunities.filter(opp => opp.upfrontCost.max > 0 && opp.upfrontCost.max <= 500);
  const mediumCostOpps = opportunities.filter(opp => opp.upfrontCost.max > 500 && opp.upfrontCost.max <= 2500);
  const highCostOpps = opportunities.filter(opp => opp.upfrontCost.max > 2500);

  let filteredOpportunities = opportunities;
  
  if (selectedCategory !== 'all') {
    filteredOpportunities = filteredOpportunities.filter(opp => opp.category === selectedCategory);
  }

  if (selectedCostTier !== 'all') {
    switch (selectedCostTier) {
      case 'free':
        filteredOpportunities = filteredOpportunities.filter(opp => opp.upfrontCost.max === 0);
        break;
      case 'low':
        filteredOpportunities = filteredOpportunities.filter(opp => opp.upfrontCost.max > 0 && opp.upfrontCost.max <= 500);
        break;
      case 'medium':
        filteredOpportunities = filteredOpportunities.filter(opp => opp.upfrontCost.max > 500 && opp.upfrontCost.max <= 2500);
        break;
      case 'high':
        filteredOpportunities = filteredOpportunities.filter(opp => opp.upfrontCost.max > 2500);
        break;
    }
  }

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

  const getCostTierBadge = (opp: SavingsOpportunity) => {
    if (opp.upfrontCost.max === 0) return <Badge className="bg-green-500">FREE</Badge>;
    if (opp.upfrontCost.max <= 500) return <Badge className="bg-blue-500">Low Cost</Badge>;
    if (opp.upfrontCost.max <= 2500) return <Badge className="bg-yellow-500">Medium Cost</Badge>;
    return <Badge className="bg-purple-500">Investment</Badge>;
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Programs & Rebates</h2>
          <p className="text-gray-600">{propertyData.address}</p>
          <p className="text-sm text-blue-600 mt-2 font-medium">
            Prioritized by cost: Start free, then scale up as you measure results
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Free Programs</p>
                <p className="text-3xl font-bold text-green-600">{noCostOpps.length}</p>
                <p className="text-xs text-gray-500 mt-1">Start here</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Low Cost (&lt;$500)</p>
                <p className="text-3xl font-bold text-blue-600">{lowCostOpps.length}</p>
                <p className="text-xs text-gray-500 mt-1">Quick wins</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Medium ($500-$2.5K)</p>
                <p className="text-3xl font-bold text-yellow-600">{mediumCostOpps.length}</p>
                <p className="text-xs text-gray-500 mt-1">With rebates</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Investments (&gt;$2.5K)</p>
                <p className="text-3xl font-bold text-purple-600">{highCostOpps.length}</p>
                <p className="text-xs text-gray-500 mt-1">Long-term</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Cost Tier:</label>
            <select
              value={selectedCostTier}
              onChange={(e) => setSelectedCostTier(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Costs</option>
              <option value="free">Free Only</option>
              <option value="low">Low Cost (&lt;$500)</option>
              <option value="medium">Medium ($500-$2.5K)</option>
              <option value="high">Investment (&gt;$2.5K)</option>
            </select>
          </div>

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
        </div>

        {/* Opportunities List */}
        <div className="space-y-4 mb-8">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <Collapsible>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-2xl">{categoryIcons[opportunity.category]}</span>
                        {getCostTierBadge(opportunity)}
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
                          <p className="text-gray-600">Your Cost</p>
                          <p className="font-semibold">
                            {opportunity.upfrontCost.max === 0 
                              ? 'FREE' 
                              : `${formatCurrency(opportunity.upfrontCost.min)} - ${formatCurrency(opportunity.upfrontCost.max)}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Payback</p>
                          <p className="font-semibold">
                            {opportunity.upfrontCost.max === 0 
                              ? 'Immediate' 
                              : `${Math.floor(opportunity.paybackMonths / 12)}y ${opportunity.paybackMonths % 12}m`}
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
                        <TabsTrigger value="benefits">Why This Matters</TabsTrigger>
                        <TabsTrigger value="steps">Action Steps</TabsTrigger>
                        <TabsTrigger value="rebates">Programs & Rebates</TabsTrigger>
                        <TabsTrigger value="tracking">How to Track</TabsTrigger>
                      </TabsList>

                      <TabsContent value="benefits" className="space-y-2">
                        <ul className="list-disc list-inside space-y-2">
                          {opportunity.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-gray-700">{benefit}</li>
                          ))}
                        </ul>
                      </TabsContent>

                      <TabsContent value="steps" className="space-y-2">
                        <ol className="list-decimal list-inside space-y-3">
                          {opportunity.nextSteps.map((step, idx) => (
                            <li key={idx} className="text-gray-700 font-medium">{step}</li>
                          ))}
                        </ol>
                      </TabsContent>

                      <TabsContent value="rebates">
                        {opportunity.rebates.length > 0 ? (
                          <div className="space-y-3">
                            {opportunity.rebates.map((rebate, idx) => (
                              <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="font-semibold text-gray-900">{rebate.name}</p>
                                  <p className="font-bold text-green-600 text-lg">{formatCurrency(rebate.amount)}</p>
                                </div>
                                <a
                                  href={rebate.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  Apply for this rebate <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-gray-700">
                              <strong>No rebates needed!</strong> This is a free program or service available to all LA County residents.
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="tracking">
                        <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                          <p className="font-semibold text-gray-900">📊 Measurement Strategy:</p>
                          <p className="text-gray-700 text-sm">{opportunity.methodology}</p>
                          <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                            <p className="font-semibold text-sm text-gray-900 mb-2">Tracking Checklist:</p>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>✓ Document baseline (current bills/usage)</li>
                              <li>✓ Note implementation date</li>
                              <li>✓ Track monthly for 3-6 months</li>
                              <li>✓ Calculate actual savings vs. estimate</li>
                            </ul>
                          </div>
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
            Show Me My Action Plan
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;