import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bird, Lightbulb, Gift, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useProperty } from '@/context/PropertyContext';
import { lookupProperty, addToWaitlist } from '@/lib/api';
import { toast } from 'sonner';

const Home = () => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistAddress, setWaitlistAddress] = useState('');
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const navigate = useNavigate();
  const { setPropertyData, setOpportunities, setSessionId, resetSession } = useProperty();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Places API
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      console.error('Google Places API key not found');
      toast.error('Address autocomplete is not configured');
      return;
    }

    // Check if script already loaded
    if (window.google?.maps?.places) {
      setIsGoogleLoaded(true);
      return;
    }

    // Create a global callback function
    const callbackName = 'initGooglePlaces';
    (window as any)[callbackName] = () => {
      console.log('Google Places API loaded successfully');
      setIsGoogleLoaded(true);
      delete (window as any)[callbackName];
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    
    script.onerror = (error) => {
      console.error('Failed to load Google Places API:', error);
      toast.error('Failed to load address autocomplete. Please refresh the page.');
      delete (window as any)[callbackName];
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup
      delete (window as any)[callbackName];
    };
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!isGoogleLoaded || !inputRef.current || autocompleteRef.current) {
      return;
    }

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'address_components', 'geometry'],
      });

      // Strictly bias results to Los Angeles County
      const laCountyBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(33.7037, -118.6682), // Southwest
        new google.maps.LatLng(34.8233, -117.6462)  // Northeast
      );
      autocomplete.setBounds(laCountyBounds);
      autocomplete.setOptions({ strictBounds: false }); // Allow manual entry but bias to LA County

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.address_components) {
          return;
        }

        // Validate that the address is in Los Angeles County
        const isLACounty = place.address_components.some(component => {
          // Check for "Los Angeles County" or "Los Angeles" in administrative_area_level_2
          return component.types.includes('administrative_area_level_2') &&
                 (component.long_name === 'Los Angeles County' ||
                  component.short_name === 'Los Angeles County');
        });

        if (!isLACounty) {
          // Show waitlist dialog for unsupported areas
          setWaitlistAddress(place.formatted_address || '');
          setShowWaitlistDialog(true);
          setAddress('');
          if (inputRef.current) {
            inputRef.current.value = '';
          }
          return;
        }

        if (place.formatted_address) {
          setAddress(place.formatted_address);
        }
      });

      autocompleteRef.current = autocomplete;
      console.log('Google Places Autocomplete initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      toast.error('Failed to initialize address autocomplete');
    }
  }, [isGoogleLoaded]);

  const handleAnalyze = async () => {
    if (!address) {
      toast.error('Please enter an address');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await lookupProperty(address);
      
      // Store session ID and property data
      setSessionId(response.session_id);
      setPropertyData(response.property);
      setOpportunities(response.opportunities);
      
      toast.success('Property data retrieved successfully!');
      
      setTimeout(() => {
        navigate('/diagnostic');
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve property data';
      toast.error(errorMessage);
      console.error('Error looking up property:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWaitlistSubmit = async () => {
    if (!waitlistEmail || !waitlistEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmittingWaitlist(true);
    
    try {
      const response = await addToWaitlist(waitlistEmail, waitlistAddress);
      
      if (response.already_registered) {
        toast.info(response.message);
      } else {
        setWaitlistSubmitted(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join waitlist';
      toast.error(errorMessage);
      console.error('Error joining waitlist:', error);
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  const handleCloseWaitlistDialog = () => {
    setShowWaitlistDialog(false);
    setWaitlistEmail('');
    setWaitlistAddress('');
    setWaitlistSubmitted(false);
  };

  const handleNewSearch = () => {
    resetSession();
    setAddress('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bird className="w-8 h-8 text-blue-600" />
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
            Home Ownership Cost Saver
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            Get personalized recommendations for no-cost and low-cost actions that deliver real savings.
          </p>
          <p className="text-lg text-blue-600 font-semibold mb-12">
            "What gets measured, gets managed" - Start tracking your home's performance today.
          </p>

          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto mb-16">
            <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter your LA County home address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !document.querySelector('.pac-container:hover')) {
                      e.preventDefault();
                      handleAnalyze();
                    }
                  }}
                  className="pl-10 h-14 text-lg"
                  autoComplete="off"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8"
                disabled={isLoading || !address}
              >
                {isLoading ? 'Analyzing...' : 'Find Programs'}
              </Button>
            </form>
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

      {/* Waitlist Dialog */}
      <Dialog open={showWaitlistDialog} onOpenChange={setShowWaitlistDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {waitlistSubmitted ? 'You\'re on the Waitlist!' : 'Area Not Yet Supported'}
            </DialogTitle>
            <DialogDescription>
              {waitlistSubmitted ? (
                <span className="text-green-600 font-medium">
                  We'll reach out once your area is supported!
                </span>
              ) : (
                'This address is not yet supported. Enter your email and we\'ll notify you when it becomes available.'
              )}
            </DialogDescription>
          </DialogHeader>
          
          {!waitlistSubmitted ? (
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Address
                </label>
                <Input
                  type="text"
                  value={waitlistAddress}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleWaitlistSubmit();
                    }
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleWaitlistSubmit}
                  disabled={isSubmittingWaitlist}
                  className="flex-1"
                >
                  {isSubmittingWaitlist ? 'Joining...' : 'Join Waitlist'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseWaitlistDialog}
                  disabled={isSubmittingWaitlist}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-4">
              <Button onClick={handleCloseWaitlistDialog} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;