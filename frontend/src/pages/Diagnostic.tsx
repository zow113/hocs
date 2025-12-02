import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bird, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProperty } from '@/context/PropertyContext';
import { SavingsOpportunity } from '@/types/property';

const Diagnostic = () => {
  const navigate = useNavigate();
  const { propertyData, opportunities, resetSession } = useProperty();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<SavingsOpportunity | null>(null);

  useEffect(() => {
    if (!propertyData || opportunities.length === 0) {
      navigate('/');
    }
  }, [propertyData, opportunities, navigate]);

  if (!propertyData || opportunities.length === 0) return null;

  let filteredOpportunities = opportunities;
  
  if (selectedCategory !== 'all') {
    filteredOpportunities = filteredOpportunities.filter(opp => opp.category === selectedCategory);
  }

  // Sort by cost tier (free first), then by annual savings
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (a.upfrontCost.max === 0 && b.upfrontCost.max !== 0) return -1;
    if (a.upfrontCost.max !== 0 && b.upfrontCost.max === 0) return 1;
    if (a.upfrontCost.max === 0 && b.upfrontCost.max === 0) {
      return b.annualSavings - a.annualSavings;
    }
    return a.upfrontCost.max - b.upfrontCost.max;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getSourceBadge = (category: string) => {
    const sources: Record<string, { label: string; color: string }> = {
      'energy': { label: 'Utility / State', color: 'bg-blue-100 text-blue-800' },
      'solar': { label: 'Federal / State', color: 'bg-yellow-100 text-yellow-800' },
      'water': { label: 'Water District', color: 'bg-cyan-100 text-cyan-800' },
      'maintenance': { label: 'Private / DIY', color: 'bg-gray-100 text-gray-800' }
    };
    const source = sources[category] || sources['maintenance'];
    return <Badge className={source.color}>{source.label}</Badge>;
  };

  const getEffortBadge = (difficulty: string) => {
    const efforts: Record<string, { label: string; color: string }> = {
      'DIY': { label: 'Low', color: 'bg-green-100 text-green-800' },
      'Professional': { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
      'Specialist': { label: 'High', color: 'bg-red-100 text-red-800' }
    };
    const effort = efforts[difficulty] || efforts['Professional'];
    return <Badge className={effort.color}>{effort.label}</Badge>;
  };

  const categories = Array.from(new Set(opportunities.map(opp => opp.category)));
  const totalPotentialSavings = opportunities.reduce((sum, opp) => sum + opp.annualSavings, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bird className="w-8 h-8 text-blue-600" />
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Savings & Programs</h2>
          <p className="text-gray-600 mb-4">{propertyData.address}</p>
          <p className="text-sm text-gray-700">
            All available programs, rebates, and opportunities for your home. Start with free programs at the top, then work your way down as you track results.
          </p>
        </div>

        {/* Summary Card */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">Total Potential Annual Savings</p>
              <p className="text-5xl font-bold text-green-600 mb-4">{formatCurrency(totalPotentialSavings)}</p>
              <p className="text-gray-600">
                If you complete all recommended actions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mr-2">Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'energy' && 'Energy Efficiency'}
                {cat === 'solar' && 'Solar & Renewable'}
                {cat === 'water' && 'Water Conservation'}
                {cat === 'maintenance' && 'Maintenance & Upgrades'}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Item / Program</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Source</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">What it is</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Est. Annual Savings</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Your Cost</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Effort Level</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedOpportunities.map((opportunity) => (
                    <tr key={opportunity.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{opportunity.name}</div>
                        {opportunity.upfrontCost.max === 0 && (
                          <Badge className="bg-green-500 mt-1">FREE</Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {getSourceBadge(opportunity.category)}
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {opportunity.benefits[0]}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(opportunity.annualSavings)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium">
                          {opportunity.upfrontCost.max === 0 
                            ? '$0' 
                            : opportunity.upfrontCost.min === opportunity.upfrontCost.max
                            ? formatCurrency(opportunity.upfrontCost.max)
                            : `${formatCurrency(opportunity.upfrontCost.min)}–${formatCurrency(opportunity.upfrontCost.max)}`}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {getEffortBadge(opportunity.difficulty)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedOpportunity(opportunity)}
                            >
                              <Info className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{opportunity.name}</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-6 pt-4">
                              {/* Summary */}
                              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="text-sm text-gray-600">Annual Savings</p>
                                  <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(opportunity.annualSavings)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Your Cost</p>
                                  <p className="text-xl font-semibold">
                                    {opportunity.upfrontCost.max === 0 
                                      ? 'FREE' 
                                      : `${formatCurrency(opportunity.upfrontCost.min)}–${formatCurrency(opportunity.upfrontCost.max)}`}
                                  </p>
                                </div>
                              </div>

                              {/* Benefits */}
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Why This Matters</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                  {opportunity.benefits.map((benefit, idx) => (
                                    <li key={idx}>{benefit}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Action Steps */}
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-2">🎯 Action Steps</h3>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                  {opportunity.nextSteps.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                  ))}
                                </ol>
                              </div>

                              {/* Rebates */}
                              {opportunity.rebates.length > 0 && (
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-2">💰 Available Rebates</h3>
                                  <div className="space-y-2">
                                    {opportunity.rebates.map((rebate, idx) => (
                                      <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex justify-between items-start mb-1">
                                          <p className="font-medium text-gray-900">{rebate.name}</p>
                                          <p className="font-bold text-green-600">{formatCurrency(rebate.amount)}</p>
                                        </div>
                                        <a
                                          href={rebate.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                          Apply here <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Official Resources */}
                              {opportunity.officialResources && opportunity.officialResources.length > 0 && (
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-2">📋 Official Resources</h3>
                                  <div className="space-y-2">
                                    {opportunity.officialResources.map((resource, idx) => (
                                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex-1">
                                            <p className="font-medium text-gray-900 text-sm">{resource.name}</p>
                                            <Badge variant="outline" className="text-xs mt-1">
                                              {resource.type === 'government' && '🏛️ Government'}
                                              {resource.type === 'utility' && '⚡ Utility'}
                                              {resource.type === 'program' && '📋 Program'}
                                            </Badge>
                                          </div>
                                          <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm whitespace-nowrap"
                                          >
                                            Visit <ExternalLink className="w-3 h-3" />
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Tracking */}
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">📊 How to Track Results</h3>
                                <p className="text-sm text-gray-700">{opportunity.methodology}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
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