import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Download, GripVertical, X, RotateCcw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProperty } from '@/context/PropertyContext';
import { SavingsOpportunity, PrioritizedPlan as PrioritizedPlanType } from '@/types/property';
import { toast } from 'sonner';

const Plan = () => {
  const navigate = useNavigate();
  const { propertyData, opportunities, prioritizedPlan, setPrioritizedPlan, resetSession } = useProperty();
  const [topOpportunities, setTopOpportunities] = useState<SavingsOpportunity[]>([]);
  const [secondaryOpportunities, setSecondaryOpportunities] = useState<SavingsOpportunity[]>([]);
  const [customized, setCustomized] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!propertyData || opportunities.length === 0) {
      navigate('/');
      return;
    }

    // Generate prioritized plan if not already created
    if (!prioritizedPlan) {
      const scored = opportunities.map(opp => ({
        ...opp,
        score: (opp.annualSavings * 0.4) + 
               ((10000 - opp.upfrontCost.min) * 0.25) + 
               ((100 - opp.paybackMonths) * 0.2) + 
               (opp.confidenceScore * 0.15)
      })).sort((a, b) => b.score - a.score);

      const top = scored.slice(0, 5);
      const secondary = scored.slice(5);

      const plan: PrioritizedPlanType = {
        topOpportunities: top,
        secondaryOpportunities: secondary,
        totalAnnualSavings: top.reduce((sum, opp) => sum + opp.annualSavings, 0),
        customized: false
      };

      setPrioritizedPlan(plan);
      setTopOpportunities(top);
      setSecondaryOpportunities(secondary);
    } else {
      setTopOpportunities(prioritizedPlan.topOpportunities);
      setSecondaryOpportunities(prioritizedPlan.secondaryOpportunities);
      setCustomized(prioritizedPlan.customized);
    }
  }, [propertyData, opportunities, prioritizedPlan, setPrioritizedPlan, navigate]);

  if (!propertyData) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleRemoveOpportunity = (id: string) => {
    const removed = topOpportunities.find(opp => opp.id === id);
    if (!removed) return;

    const newTop = topOpportunities.filter(opp => opp.id !== id);
    
    // Promote next opportunity from secondary list
    if (secondaryOpportunities.length > 0) {
      const promoted = secondaryOpportunities[0];
      newTop.push(promoted);
      setSecondaryOpportunities(secondaryOpportunities.slice(1));
    }

    setTopOpportunities(newTop);
    setCustomized(true);

    const plan: PrioritizedPlanType = {
      topOpportunities: newTop,
      secondaryOpportunities,
      totalAnnualSavings: newTop.reduce((sum, opp) => sum + opp.annualSavings, 0),
      customized: true
    };
    setPrioritizedPlan(plan);

    toast.success('Plan updated');
  };

  const handleReset = () => {
    const scored = opportunities.map(opp => ({
      ...opp,
      score: (opp.annualSavings * 0.4) + 
             ((10000 - opp.upfrontCost.min) * 0.25) + 
             ((100 - opp.paybackMonths) * 0.2) + 
             (opp.confidenceScore * 0.15)
    })).sort((a, b) => b.score - a.score);

    const top = scored.slice(0, 5);
    const secondary = scored.slice(5);

    setTopOpportunities(top);
    setSecondaryOpportunities(secondary);
    setCustomized(false);

    const plan: PrioritizedPlanType = {
      topOpportunities: top,
      secondaryOpportunities: secondary,
      totalAnnualSavings: top.reduce((sum, opp) => sum + opp.annualSavings, 0),
      customized: false
    };
    setPrioritizedPlan(plan);

    toast.success('Plan reset to recommended order');
  };

  const handleEmailReport = () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Simulate sending email
    toast.success(`Report will be sent to ${email} within 1 minute`);
    setEmailDialogOpen(false);
    setEmail('');
  };

  const handleDownloadPDF = () => {
    toast.success('PDF report is being generated...');
    // In a real app, this would generate and download a PDF
    setTimeout(() => {
      toast.success('PDF downloaded successfully!');
    }, 2000);
  };

  const totalSavings = topOpportunities.reduce((sum, opp) => sum + opp.annualSavings, 0);

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
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-gray-900">Your Prioritized Savings Plan</h2>
            {customized && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Recommended
              </Button>
            )}
          </div>
          <p className="text-gray-600">{propertyData.address}</p>
          {customized && (
            <Badge variant="secondary" className="mt-2">Customized Plan</Badge>
          )}
        </div>

        {/* Summary Card */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">Total Potential Annual Savings</p>
              <p className="text-5xl font-bold text-green-600 mb-4">{formatCurrency(totalSavings)}</p>
              <p className="text-gray-600">
                If you complete all top 5 recommendations
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Opportunities */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Top 5 Priorities</h3>
          <div className="space-y-4">
            {topOpportunities.map((opportunity, index) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl">{opportunity.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOpportunity(opportunity.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Annual Savings</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(opportunity.annualSavings)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Upfront Cost</p>
                          <p className="font-semibold">
                            {formatCurrency(opportunity.upfrontCost.min)} - {formatCurrency(opportunity.upfrontCost.max)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Difficulty</p>
                          <Badge variant="secondary">{opportunity.difficulty}</Badge>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Key Benefits:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {opportunity.benefits.slice(0, 3).map((benefit, idx) => (
                            <li key={idx}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Next Steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                          {opportunity.nextSteps.slice(0, 2).map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Secondary Opportunities */}
        {secondaryOpportunities.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">More Opportunities to Consider</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {secondaryOpportunities.map((opportunity) => (
                <Card key={opportunity.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{opportunity.name}</CardTitle>
                    <div className="flex gap-4 text-sm mt-2">
                      <div>
                        <p className="text-gray-600">Annual Savings</p>
                        <p className="font-bold text-green-600">{formatCurrency(opportunity.annualSavings)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Upfront Cost</p>
                        <p className="font-semibold">{formatCurrency(opportunity.upfrontCost.min)}+</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleDownloadPDF} className="px-8">
            <Download className="mr-2 w-5 h-5" />
            Download Full Report
          </Button>

          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="px-8">
                <Mail className="mr-2 w-5 h-5" />
                Email Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Email Your Report</DialogTitle>
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
                <p className="text-sm text-gray-600">
                  We'll send your personalized savings report to this email address. You can also opt-in to receive updates about new savings opportunities.
                </p>
                <Button onClick={handleEmailReport} className="w-full">
                  Send Report
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