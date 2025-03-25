
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import IntegrationGuide from '@/components/onboarding/IntegrationGuide';

const Integration = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isSidebarOpen={isSidebarOpen} />
      
      <main className={`pt-20 px-4 pb-8 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 animate-fade-up">
            <h1 className="text-3xl font-semibold tracking-tight">Integration Guide</h1>
            <p className="text-muted-foreground mt-1">Learn how to integrate ChurnGuardian with your application</p>
          </div>
          
          <IntegrationGuide />
        </div>
      </main>
    </div>
  );
};

export default Integration;
