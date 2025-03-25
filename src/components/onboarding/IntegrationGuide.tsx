
import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Copy, ArrowRight, TerminalSquare, FileJson, Globe, Server, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const IntegrationGuide: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string, language: string, id: string }) => (
    <div className="relative mt-4 group">
      <div className="absolute top-3 right-3 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleCopy(code, id)}
        >
          {copied === id ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="relative rounded-lg overflow-hidden bg-muted/70 p-4 text-sm">
        <div className="absolute top-0 left-0 px-2 py-1 text-xs font-mono text-muted-foreground bg-muted border-r border-b border-muted-foreground/10 rounded-br">
          {language}
        </div>
        <code className="font-mono text-sm text-foreground">{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="overflow-hidden border-none shadow-card">
        <CardHeader className="bg-brand text-white">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/20 text-white border-none text-xs font-normal">
              Documentation
            </Badge>
          </div>
          <CardTitle className="text-2xl">Integration Guide</CardTitle>
          <CardDescription className="text-white/80 max-w-2xl">
            Follow these steps to integrate ChurnGuardian into your application and start tracking user behavior for accurate churn prediction.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="javascript">
            <div className="flex items-center justify-between">
              <TabsList className="bg-muted/60 h-9">
                <TabsTrigger value="javascript" className="text-sm px-4">JavaScript</TabsTrigger>
                <TabsTrigger value="react" className="text-sm px-4">React</TabsTrigger>
                <TabsTrigger value="ios" className="text-sm px-4">iOS</TabsTrigger>
                <TabsTrigger value="android" className="text-sm px-4">Android</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Your API Key:</span>
                <code className="px-2 py-1 text-sm bg-muted rounded font-mono">cg_1234567890</code>
              </div>
            </div>
            
            <div className="mt-6 space-y-6">
              <TabsContent value="javascript" className="space-y-8 mt-0">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-brand" />
                    1. Add the tracking script
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Add the ChurnGuardian tracking script to your website's HTML, ideally in the <code>&lt;head&gt;</code> section:
                  </p>
                  <CodeBlock 
                    language="html" 
                    id="js-script" 
                    code={`<script>
  (function(w, d, s, o){
    w.ChurnGuardian = w.ChurnGuardian || function(){
      (w.ChurnGuardian.q = w.ChurnGuardian.q || []).push(arguments)
    };
    var js, fjs = d.getElementsByTagName(s)[0];
    js = d.createElement(s); js.async=1;
    js.src = 'https://cdn.churnguardian.io/tracker.min.js';
    fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script'));
  
  // Initialize with your API key
  ChurnGuardian('init', { apiKey: 'cg_1234567890' });
</script>`} 
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <TerminalSquare className="h-5 w-5 text-brand" />
                    2. Track user identification
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    When a user signs in, identify them using this code:
                  </p>
                  <CodeBlock 
                    language="javascript" 
                    id="js-identify" 
                    code={`// Call this when a user logs in or you know their identity
ChurnGuardian('identify', 'user-id-123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium',
  signupDate: '2023-05-12'
});`} 
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-brand" />
                    3. Track custom events
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Track important user actions to improve your churn prediction accuracy:
                  </p>
                  <CodeBlock 
                    language="javascript" 
                    id="js-track" 
                    code={`// Track feature usage
ChurnGuardian('track', 'feature_used', {
  featureName: 'export_report',
  timeSpent: 45,
  succeeded: true
});

// Track user satisfaction
ChurnGuardian('track', 'rated_app', {
  rating: 4,
  feedback: 'Great app but could use more export options'
});`} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="react" className="space-y-8 mt-0">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <TerminalSquare className="h-5 w-5 text-brand" />
                    1. Install the package
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Install the ChurnGuardian React SDK through npm or yarn:
                  </p>
                  <CodeBlock 
                    language="bash" 
                    id="react-install" 
                    code={`npm install @churnguardian/react
# or
yarn add @churnguardian/react`} 
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-brand" />
                    2. Initialize the provider
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Wrap your application with the ChurnGuardian provider:
                  </p>
                  <CodeBlock 
                    language="jsx" 
                    id="react-provider" 
                    code={`import { ChurnGuardianProvider } from '@churnguardian/react';
import App from './App';

ReactDOM.render(
  <ChurnGuardianProvider apiKey="cg_1234567890">
    <App />
  </ChurnGuardianProvider>,
  document.getElementById('root')
);`} 
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Server className="h-5 w-5 text-brand" />
                    3. Use the hook in your components
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Use the hook to track events in your components:
                  </p>
                  <CodeBlock 
                    language="jsx" 
                    id="react-hook" 
                    code={`import { useChurnGuardian } from '@churnguardian/react';

function ProfilePage({ user }) {
  const { identify, track } = useChurnGuardian();
  
  useEffect(() => {
    // Identify user when component mounts
    identify(user.id, {
      email: user.email,
      name: user.name,
      plan: user.subscription.name
    });
  }, [user]);
  
  const handleExport = () => {
    // Track when user exports data
    track('data_exported', {
      format: 'csv',
      recordCount: 142
    });
    
    // ... export logic
  };
  
  return (
    <div>
      {/* Your component JSX */}
      <button onClick={handleExport}>Export Data</button>
    </div>
  );
}`} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="ios" className="space-y-8 mt-0">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-brand" />
                    iOS SDK Coming Soon
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Our iOS SDK is currently in beta. Join the waitlist for early access.
                  </p>
                  <Button variant="outline" className="mt-2">
                    Join iOS Beta Waitlist
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="android" className="space-y-8 mt-0">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-brand" />
                    Android SDK Coming Soon
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Our Android SDK is currently in development. Join the waitlist for early access.
                  </p>
                  <Button variant="outline" className="mt-2">
                    Join Android Beta Waitlist
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about integrating ChurnGuardian</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What data does ChurnGuardian collect?</AccordionTrigger>
              <AccordionContent>
                ChurnGuardian collects user interaction data such as feature usage, session duration, click events, and
                custom events you define. We never collect personally identifiable information unless explicitly provided
                through the identify method. All data is encrypted in transit and at rest.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How does this impact my application's performance?</AccordionTrigger>
              <AccordionContent>
                Our SDK is designed to be lightweight (less than 10KB gzipped) and uses batching to minimize network requests.
                The SDK runs asynchronously and won't block your application's main thread. In our tests, the impact on
                page load time is typically less than 50ms.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is ChurnGuardian GDPR and CCPA compliant?</AccordionTrigger>
              <AccordionContent>
                Yes, ChurnGuardian is designed with privacy regulations in mind. We provide tools to manage user consent,
                data deletion requests, and data export requests. Our documentation includes templates for privacy policy
                additions to help you stay compliant.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How accurate are the churn predictions?</AccordionTrigger>
              <AccordionContent>
                Prediction accuracy improves over time as our models learn from your specific user patterns. Typically,
                after 30 days of data collection, our predictions reach 80-85% accuracy. With comprehensive event tracking
                and user properties, accuracy can reach 90-95% for established applications.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationGuide;
