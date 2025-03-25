
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, LineChart, Users, BarChart3, Mail, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: <LineChart className="h-6 w-6 text-brand" />,
      title: 'Behavior Tracking',
      description: 'Monitor user actions and engagement patterns to identify potential churn triggers.'
    },
    {
      icon: <Users className="h-6 w-6 text-brand" />,
      title: 'AI-Powered Predictions',
      description: 'Leverage machine learning to identify users at risk of churning before they leave.'
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-brand" />,
      title: 'Automated Interventions',
      description: 'Deploy targeted retention strategies automatically when users show signs of disengagement.'
    },
    {
      icon: <Mail className="h-6 w-6 text-brand" />,
      title: 'Custom Campaigns',
      description: 'Create personalized retention campaigns based on user behavior and preferences.'
    },
    {
      icon: <Shield className="h-6 w-6 text-brand" />,
      title: 'Privacy Compliant',
      description: 'GDPR and CCPA compliant data collection with built-in consent management.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        {/* Hero Background */}
        <div 
          className="absolute inset-0 z-0 bg-gradient-to-b from-brand/5 to-transparent"
          style={{ 
            backgroundImage: "radial-gradient(circle at 25% 10%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)"
          }}
        />
        
        {/* Header */}
        <header className="relative z-10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-brand flex items-center justify-center text-white font-semibold">
                  CG
                </div>
                <span className="text-xl font-medium">ChurnGuardian</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Hero Section */}
        <section className="relative z-10 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <Badge 
              variant="outline" 
              className={cn(
                "bg-brand/10 text-brand border-brand/20 mb-6 transition-all duration-700",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              Introducing ChurnGuardian
            </Badge>
            
            <h1 
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 max-w-3xl mx-auto transition-all duration-700 delay-100",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              Predict & Prevent Customer Churn with Precision
            </h1>
            
            <p 
              className={cn(
                "text-lg text-muted-foreground mb-10 max-w-2xl mx-auto transition-all duration-700 delay-200",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              ChurnGuardian helps SaaS businesses identify at-risk users through advanced behavior tracking and AI-powered prediction, enabling proactive retention strategies.
            </p>
            
            <div 
              className={cn(
                "flex flex-col sm:flex-row justify-center gap-4 transition-all duration-700 delay-300",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <Button 
                size="lg" 
                className="text-md gap-2"
                onClick={() => navigate('/dashboard')}
              >
                Explore Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-md"
                onClick={() => navigate('/integration')}
              >
                Integration Guide
              </Button>
            </div>
          </div>
        </section>
        
        {/* Dashboard Preview */}
        <section className="relative z-10 pb-16 md:pb-24">
          <div className="container mx-auto px-4">
            <div 
              className={cn(
                "rounded-xl shadow-2xl overflow-hidden border border-muted transition-all duration-1000 delay-500",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
            >
              <img 
                src="https://res.cloudinary.com/dewy2csvc/image/upload/v1682631308/dashboard-preview_u0ffku.jpg" 
                alt="Dashboard Preview" 
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </div>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Comprehensive Churn Management</h2>
            <p className="text-lg text-muted-foreground">
              Every tool you need to understand, predict, and prevent customer churn in one powerful platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={cn(
                  "border border-muted bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-fade-up",
                  "overflow-hidden"
                )}
                style={{ animationDelay: `${100 * index}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-brand text-white rounded-2xl overflow-hidden shadow-lg shadow-brand/20 animate-fade-up">
            <div className="md:flex items-center">
              <div className="p-8 md:p-12 md:w-2/3">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                  Ready to reduce your churn rate?
                </h2>
                <p className="text-white/90 text-lg mb-8 max-w-2xl">
                  Join leading SaaS companies using ChurnGuardian to identify at-risk users before they leave, 
                  enabling timely interventions and increasing customer lifetime value.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="text-brand"
                    onClick={() => navigate('/dashboard')}
                  >
                    Get Started
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-brand"
                    onClick={() => navigate('/integration')}
                  >
                    View Documentation
                  </Button>
                </div>
              </div>
              <div className="hidden md:block md:w-1/3 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand to-transparent"></div>
                <div className="h-full flex items-center justify-center pr-12">
                  <div className="w-32 h-32 relative animate-float">
                    <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md"></div>
                    <div className="absolute inset-2 rounded-full bg-white/30"></div>
                    <div className="absolute inset-4 rounded-full bg-white/50 flex items-center justify-center text-brand text-4xl font-bold">
                      CG
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center text-white font-semibold text-sm">
                CG
              </div>
              <span className="text-sm">ChurnGuardian © 2023</span>
            </div>
            
            <div className="flex gap-6 text-muted-foreground text-sm">
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
