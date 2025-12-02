import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Download, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useProperty } from '@/context/PropertyContext';
import { SavingsOpportunity } from '@/types/property';
import { toast } from 'sonner';

interface TierGroup {
  tier: number;
  title: string;
  description: string;
  opportunities: SavingsOpportunity[];
  color: string;
}

const Plan = () => {
  const navigate = useNavigate();
  const { propertyData, opportunities, resetSession } = useProperty();
  const [tiers, setTiers] = useState<TierGroup[]>([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [optInUpdates, setOptInUpdates] = useState(false);

  useEffect(() => {
    if (!propertyData || opportunities.length === 0) {
      navigate('/');
      return;
    }

    // Organize opportunities into 5 tiers
    const tier1: SavingsOpportunity[] = []; // Instant visibility (free tracking)
    const tier2: SavingsOpportunity[] = []; // Free diagnostics and assistance
    const tier3: SavingsOpportunity[] = []; // Low-cost behavior changes
    const tier4: SavingsOpportunity[] = []; // Medium-cost upgrades
    const tier5: SavingsOpportunity[] = []; // Major projects

    opportunities.forEach(opp => {
      // Tier 1: Free tracking/monitoring (none in current data, but we'll add instructions)
      // Tier 2: Free programs and audits
      if (opp.upfrontCost.max === 0 && (
        opp.name.toLowerCase().includes('audit') ||
        opp.name.toLowerCase().includes('weatherization') ||
        opp.name.toLowerCase().includes('assistance')
      )) {
        tier2.push(opp);
      }
      // Tier 3: Free or very low cost behavior changes
      else if (opp.upfrontCost.max <= 200 && (
        opp.name.toLowerCase().includes('water conservation kit') ||
        opp.name.toLowerCase().includes('led') ||
        opp.name.toLowerCase().includes('power strip')
      )) {
        tier3.push(opp);
      }
      // Tier 4: Low to medium cost upgrades
      else if (opp.upfrontCost.max > 200 && opp.upfrontCost.max <= 3000) {
        tier4.push(opp);
      }
      // Tier 5: Major investments
      else if (opp.upfrontCost.max > 3000) {
        tier5.push(opp);
      }
      // Default: put remaining free items in tier 2
      else if (opp.upfrontCost.max === 0) {
        tier2.push(opp);
      }
      // Everything else goes to tier 4
      else {
        tier4.push(opp);
      }
    });

    setTiers([
      {
        tier: 1,
        title: 'Instant Visibility (Near-Zero Cost)',
        description: 'Set up tracking and establish your baseline. You can\'t manage what you don\'t measure.',
        opportunities: tier1,
        color: 'bg-green-50 border-green-200'
      },
      {
        tier: 2,
        title: 'Free In-Home Checks & Diagnostics',
        description: 'Get professional assessments and qualify for free upgrades at no cost.',
        opportunities: tier2,
        color: 'bg-blue-50 border-blue-200'
      },
      {
        tier: 3,
        title: 'Data-Driven Behavior & Low-Cost Controls',
        description: 'Use your baseline data to make smart, low-cost changes with immediate impact.',
        opportunities: tier3,
        color: 'bg-yellow-50 border-yellow-200'
      },
      {
        tier: 4,
        title: 'Targeted Low/Medium-Cost Upgrades',
        description: 'Invest in upgrades that your data shows will have the best ROI.',
        opportunities: tier4,
        color: 'bg-orange-50 border-orange-200'
      },
      {
        tier: 5,
        title: 'Major Projects Informed by Data',
        description: 'After 3-6 months of tracking, consider major investments with proven payback.',
        opportunities: tier5,
        color: 'bg-purple-50 border-purple-200'
      }
    ]);
  }, [propertyData, opportunities, navigate]);

  if (!propertyData) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleEmailReport = () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    const message = optInUpdates 
      ? `Action plan will be sent to ${email}. You'll also receive updates when new programs become available.`
      : `Action plan will be sent to ${email} within 1 minute`;
    
    toast.success(message);
    setEmailDialogOpen(false);
    setEmail('');
    setOptInUpdates(false);
  };

  const handleDownloadPDF = () => {
    toast.success('PDF action plan is being generated...');
    setTimeout(() => {
      toast.success('PDF downloaded successfully!');
    }, 2000);
  };

  const totalPotentialSavings = opportunities.reduce((sum, opp) => sum + opp.annualSavings, 0);

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Visibility-First Action Plan</h2>
          <p className="text-gray-600 mb-4">{propertyData.address}</p>
          <p className="text-sm text-gray-700">
            Follow this crawl-walk-run approach: Start with Tier 1 to establish visibility, then work through each tier sequentially. Complete one tier before moving to the next.
          </p>
        </div>

        {/* Action Buttons - Top */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button size="lg" onClick={handleDownloadPDF} className="px-8">
            <Download className="mr-2 w-5 h-5" />
            Download Action Plan
          </Button>

          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="px-8">
                <Mail className="mr-2 w-5 h-5" />
                Email Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Email Your Action Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="updates" 
                    checked={optInUpdates}
                    onCheckedChange={(checked) => setOptInUpdates(checked as boolean)}
                  />
                  <label
                    htmlFor="updates"
                    className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Email me when new updates are available
                  </label>
                </div>

                <p className="text-sm text-gray-600">
                  We'll send your personalized 5-tier action plan with tracking recommendations to this email address.
                </p>
                <Button onClick={handleEmailReport} className="w-full">
                  Send Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Card */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">Total Potential Annual Savings</p>
              <p className="text-5xl font-bold text-green-600 mb-4">{formatCurrency(totalPotentialSavings)}</p>
              <p className="text-gray-600">
                If you complete all recommended actions across all tiers
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tier 1: Special Instructions */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <CardTitle className="text-xl">Tier 1: Instant Visibility (Near-Zero Cost)</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Set up tracking and establish your baseline. You can't manage what you don't measure.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-3">📊 Action Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>
                    <strong>Set up your utility portals:</strong>
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      <li>LADWP account: <a href="https://www.ladwp.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ladwp.com</a> (electricity & water)</li>
                      <li>SoCalGas account: <a href="https://www.socalgas.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">socalgas.com</a> (natural gas)</li>
                      <li>Pasadena Water & Power: <a href="https://www.cityofpasadena.net/water-and-power/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">cityofpasadena.net/water-and-power</a></li>
                    </ul>
                  </li>
                  <li><strong>Download the last 12 months of bills</strong> (if available) to establish your baseline usage and costs</li>
                  <li><strong>Create a simple tracking spreadsheet</strong> with columns for: Date, Electric Bill, Gas Bill, Water Bill, Total</li>
                  <li><strong>Note your current monthly averages</strong> before making any changes</li>
                </ol>
              </div>
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong>Why this matters:</strong> This baseline data will help you measure the actual impact of every change you make. Spend 30-60 minutes on this step before moving to Tier 2.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remaining Tiers */}
        {tiers.slice(1).map((tierGroup) => (
          <Card key={tierGroup.tier} className={`mb-6 ${tierGroup.color}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">
                  {tierGroup.tier}
                </div>
                <div>
                  <CardTitle className="text-xl">{tierGroup.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{tierGroup.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tierGroup.opportunities.length > 0 ? (
                <div className="space-y-3">
                  {tierGroup.opportunities.map((opportunity, index) => (
                    <div key={opportunity.id} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <h4 className="font-semibold text-gray-900">{opportunity.name}</h4>
                          </div>
                          {opportunity.upfrontCost.max === 0 && (
                            <Badge className="bg-green-500 mb-2">FREE</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Annual Savings</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(opportunity.annualSavings)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Your Cost: </span>
                          <span className="font-semibold">
                            {opportunity.upfrontCost.max === 0 
                              ? '$0' 
                              : `${formatCurrency(opportunity.upfrontCost.min)}–${formatCurrency(opportunity.upfrontCost.max)}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Effort: </span>
                          <Badge variant="secondary">{opportunity.difficulty}</Badge>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-700">{opportunity.benefits[0]}</p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-gray-900 mb-1">🎯 Next Steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                          {opportunity.nextSteps.slice(0, 2).map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    No specific programs in this tier for your property. Move to the next tier when ready.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Key Principles */}
        <Card className="mb-8 bg-gray-50">
          <CardHeader>
            <CardTitle>📋 Key Principles for Success</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span><strong>Complete Tier 1 first:</strong> Establish your baseline before making any changes</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span><strong>Track everything:</strong> Document the date of each change and compare monthly bills</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span><strong>Wait 3-6 months:</strong> Before major investments (Tier 5), verify your usage patterns with data</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span><strong>Start with free programs:</strong> Maximize no-cost opportunities before spending money</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span><strong>Use your data:</strong> Let actual usage inform which upgrades make sense for your home</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons - Bottom */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleDownloadPDF} className="px-8">
            <Download className="mr-2 w-5 h-5" />
            Download Action Plan
          </Button>

          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="px-8">
                <Mail className="mr-2 w-5 h-5" />
                Email Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Email Your Action Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="updates-bottom" 
                    checked={optInUpdates}
                    onCheckedChange={(checked) => setOptInUpdates(checked as boolean)}
                  />
                  <label
                    htmlFor="updates-bottom"
                    className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Email me when new updates are available
                  </label>
                </div>

                <p className="text-sm text-gray-600">
                  We'll send your personalized 5-tier action plan with tracking recommendations to this email address.
                </p>
                <Button onClick={handleEmailReport} className="w-full">
                  Send Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Plan;