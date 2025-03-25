
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { supabase } from '@/integrations/supabase/client';

const Integration = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [clientName, setClientName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Create a new API key
  const createApiKey = async () => {
    if (!clientName.trim()) {
      toast.error('Please enter a client name');
      return;
    }

    setIsCreatingKey(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-api-key', {
        body: { name: clientName.trim() },
      });

      if (error) throw error;
      
      if (data.success && data.client) {
        setApiKey(data.client.api_key);
        toast.success('API key created successfully');
      } else {
        throw new Error('Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key. Please try again.');
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Copy content to clipboard
  const copyToClipboard = (content: string, message: string) => {
    navigator.clipboard.writeText(content)
      .then(() => toast.success(message))
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  const getScriptCode = () => {
    return `<!-- ChurnGuardian Tracking Script -->
<script src="https://cdn.jsdelivr.net/gh/your-org/churn-guardian@latest/churn-guardian.min.js"></script>
<script>
  new ChurnGuardian({
    apiKey: '${apiKey || 'YOUR_API_KEY'}',
    debug: false,
    trackPageViews: true,
    trackClicks: true,
    trackForms: true,
    trackErrors: true
  });
</script>`;
  };

  const getNpmCode = () => {
    return `// Install the package
npm install churn-guardian

// Import and initialize in your app
import ChurnGuardian from 'churn-guardian';

const tracker = new ChurnGuardian({
  apiKey: '${apiKey || 'YOUR_API_KEY'}',
  debug: false
});

// Identify users when they log in
tracker.identify('user123', {
  name: 'John Doe',
  email: 'john@example.com',
  plan: 'premium'
});

// Track custom events
tracker.track('feature_used', {
  feature_name: 'export_data',
  duration_seconds: 45
});`;
  };

  const getAdvancedCode = () => {
    return `// Full ChurnGuardian configuration
const guardian = new ChurnGuardian({
  apiKey: '${apiKey || 'YOUR_API_KEY'}',
  endpoint: 'https://szjgbkjztoqlqhjeaspu.supabase.co/functions/v1',
  trackPageViews: true,
  trackClicks: true,
  trackForms: true,
  trackErrors: true,
  identifyFromUrl: true,
  userIdParam: 'uid',
  debug: true
});

// Event tracking examples
guardian.track('subscription_updated', {
  old_plan: 'basic',
  new_plan: 'premium',
  billing_cycle: 'annual'
});

guardian.track('feedback_submitted', {
  rating: 4,
  comments: 'Great app, but could use more features'
});

// Get churn prediction for current user
guardian.getPrediction((error, prediction) => {
  if (error) {
    console.error('Error getting prediction:', error);
    return;
  }
  
  console.log('User risk score:', prediction.risk_score);
  console.log('Risk factors:', prediction.risk_factors);
  
  // Take action based on risk score
  if (prediction.risk_score > 0.7) {
    showRetentionOffer();
  }
});`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isSidebarOpen={isSidebarOpen} />
      
      <main className={`pt-20 px-4 pb-8 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Integration Guide</h1>
              <p className="text-muted-foreground mt-1">Add ChurnGuardian tracking to your application</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card className="sticky top-24 transition-all duration-300 hover:shadow-card animate-fade-up">
                <CardHeader>
                  <CardTitle>Get Your API Key</CardTitle>
                  <CardDescription>Create an API key to start tracking user behavior</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="clientName" className="text-sm font-medium">Client/Website Name</label>
                      <Input 
                        id="clientName"
                        placeholder="My Website"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </div>
                    
                    {apiKey && (
                      <div className="mt-4 space-y-2">
                        <label htmlFor="apiKey" className="text-sm font-medium">Your API Key</label>
                        <div className="flex">
                          <Input 
                            id="apiKey"
                            value={apiKey}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => copyToClipboard(apiKey, 'API key copied to clipboard')}
                            className="ml-2"
                          >
                            <Code size={16} />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Keep this key secure and don't share it publicly.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={createApiKey} 
                    disabled={isCreatingKey || !clientName.trim()}
                    className="w-full"
                  >
                    {isCreatingKey ? 'Creating...' : 'Create API Key'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="transition-all duration-300 hover:shadow-card animate-fade-up">
                <CardHeader>
                  <CardTitle>Installation Instructions</CardTitle>
                  <CardDescription>Follow these steps to add ChurnGuardian to your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6">
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      You need an API key before you can start tracking. Create one using the form on the left.
                    </AlertDescription>
                  </Alert>
                  
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="basic">Basic Website</TabsTrigger>
                      <TabsTrigger value="npm">NPM Module</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced Usage</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Step 1: Add the Script</h3>
                        <p className="text-muted-foreground mb-3">
                          Copy and paste this code snippet just before the closing <code>&lt;/body&gt;</code> tag on your website.
                        </p>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                            <code>{getScriptCode()}</code>
                          </pre>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(getScriptCode(), 'Script code copied to clipboard')}
                          >
                            <Code size={14} className="mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Step 2: Identify Your Users (Optional)</h3>
                        <p className="text-muted-foreground mb-3">
                          For better tracking, identify your users when they log in:
                        </p>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                            <code>{`// After user logs in
ChurnGuardian.identify('user_123', {
  name: 'John Doe',
  email: 'john@example.com',
  plan: 'premium'
});`}</code>
                          </pre>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(`// After user logs in
ChurnGuardian.identify('user_123', {
  name: 'John Doe',
  email: 'john@example.com',
  plan: 'premium'
});`, 'User identification code copied to clipboard')}
                          >
                            <Code size={14} className="mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="npm" className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">NPM Installation</h3>
                        <p className="text-muted-foreground mb-3">
                          For React, Vue, Angular, or other JavaScript frameworks:
                        </p>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                            <code>{getNpmCode()}</code>
                          </pre>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(getNpmCode(), 'NPM code copied to clipboard')}
                          >
                            <Code size={14} className="mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="advanced" className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Advanced Configuration</h3>
                        <p className="text-muted-foreground mb-3">
                          Customize tracking and use advanced features:
                        </p>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                            <code>{getAdvancedCode()}</code>
                          </pre>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(getAdvancedCode(), 'Advanced code copied to clipboard')}
                          >
                            <Code size={14} className="mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card className="mt-8 transition-all duration-300 hover:shadow-card animate-fade-up">
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>What ChurnGuardian tracks and how it predicts churn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Data Collection</h3>
                      <p className="text-muted-foreground">
                        ChurnGuardian automatically tracks:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                        <li>Page views and navigation patterns</li>
                        <li>Button and link clicks</li>
                        <li>Form submissions</li>
                        <li>JavaScript errors</li>
                        <li>Custom events you define</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Churn Prediction</h3>
                      <p className="text-muted-foreground">
                        Our AI analyzes user behavior to identify patterns that indicate potential churn:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                        <li>Decreased usage frequency</li>
                        <li>Shorter session durations</li>
                        <li>Less feature engagement</li>
                        <li>Increased error rates</li>
                        <li>Changes in usage patterns</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Privacy & Compliance</h3>
                      <p className="text-muted-foreground">
                        ChurnGuardian is designed with privacy in mind:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                        <li>No personal data is collected unless explicitly provided</li>
                        <li>All data is securely stored and processed</li>
                        <li>Compatible with GDPR, CCPA, and other privacy regulations</li>
                        <li>Easy to implement consent management</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Integration;
