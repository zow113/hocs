import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home as HomeIcon, Lightbulb, Gift, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useProperty } from '@/context/PropertyContext';
import { mockPropertyData, laCountyAddresses, generateMockOpportunities } from '@/utils/mockData';
import { toast } from 'sonner';

const Home = () => {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { setPropertyData, setOpportunities, resetSession } = useProperty();

  const handleAddressChange = (value: string) => {
    setAddress(value);
    
    if (value.length > 2) {
      const filtered = laCountyAddresses.filter(addr =>
        addr.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddressSelect = (selectedAddress: string) => {
    setAddress(selectedAddress);
    setShowSuggestions(false);
  };

  const handleAnalyze = () => {
    if (!address) {
      toast.error('Please enter an address');
      return;
    }

    const isLACounty = laCountyAddresses.some(addr =>
      addr.toLowerCase().includes(address.toLowerCase())
    );

    if (!isLACounty) {
      toast.error('Address must be in Los Angeles County. Please check your address and try again.');
      return;
    }

    const propertyKey = Object.keys(mockPropertyData).find(key =>
      key.toLowerCase().includes(address.toLowerCase())
    );

    if (propertyKey) {
      const property = mockPropertyData[propertyKey];
      const opportunities = generateMockOpportunities(property);
      
      setPropertyData(property);
      setOpportunities(opportunities);
      
      toast.success('Property data retrieved successfully!');
      
      setTimeout(() => {
        navigate('/diagnostic');
      }, 500);
    } else {
      toast.error('Property not found. Please try a different address.');
    }
  };

  const handleNewSearch = () => {
    resetSession();
    setAddress('');
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HomeIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">HOCS</h1>
            </div>
            <Button variant="outline" onClick={handleNewSearch}>
              New Search
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Free Programs & Rebates for Your LA County Home
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            Get personalized recommendations for no-cost and low-cost actions that deliver real savings.
          </p>
          <p className="text-lg text-blue-600 font-semibold mb-12">
            "What gets measured, gets managed" - Start tracking your home's performance today.
          </p>

          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto mb-16">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Enter your LA County home address..."
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onFocus={() => address.length > 2 && setShowSuggestions(true)}
                  className="pl-10 h-14 text-lg"
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleAddressSelect(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        <div className="flex items-center">
                          <HomeIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleAnalyze} size="lg" className="h-14 px-8">
                Find Programs
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-left">
              Try: "123 Main St, Pasadena" or "456 Oak Ave, Los Angeles"
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Free Programs First</h3>
              <p className="text-gray-600 text-sm">
                Start with no-cost energy audits, free conservation kits, and available rebates
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Actionable Insights</h3>
              <p className="text-gray-600 text-sm">
                Clear next steps with links to programs, rebate applications, and tracking tools
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Measure & Manage</h3>
              <p className="text-gray-600 text-sm">
                Track your progress with baseline measurements and monthly monitoring
              </p>
            </Card>
          </div>

          {/* Educational Note */}
          <div className="mt-12 p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">How It Works</h3>
            <div className="text-left space-y-2 text-gray-700">
              <p><strong>1. Start Free:</strong> We prioritize no-cost programs like free energy audits and conservation kits</p>
              <p><strong>2. Low-Cost, High Impact:</strong> Then show affordable upgrades with quick payback and available rebates</p>
              <p><strong>3. Track Everything:</strong> Get baseline measurements and monthly tracking recommendations</p>
              <p><strong>4. Scale Up:</strong> When ready, explore larger investments with significant long-term savings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;