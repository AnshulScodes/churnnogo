
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Users, BarChart, ArrowRight, ArrowDown, MessageSquare, PercentSquare, GitFork, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ChurnMetrics from '@/components/dashboard/ChurnMetrics';
import UserRiskTable from '@/components/dashboard/UserRiskTable';
import ChartComponent from '@/components/dashboard/ChartComponent';
import { toast } from 'sonner';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      toast.success('Dashboard data loaded successfully');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Mock data for charts
  const monthlyChurnData = [
    { name: 'Jan', churned: 5.2, retained: 94.8 },
    { name: 'Feb', churned: 4.8, retained: 95.2 },
    { name: 'Mar', churned: 6.3, retained: 93.7 },
    { name: 'Apr', churned: 7.1, retained: 92.9 },
    { name: 'May', churned: 6.5, retained: 93.5 },
    { name: 'Jun', churned: 4.2, retained: 95.8 },
    { name: 'Jul', churned: 3.8, retained: 96.2 },
    { name: 'Aug', churned: 3.2, retained: 96.8 },
  ];

  const churnReasonData = [
    { name: 'Price', value: 35 },
    { name: 'Features', value: 25 },
    { name: 'UX Issues', value: 20 },
    { name: 'Competition', value: 15 },
    { name: 'Other', value: 5 },
  ];

  // Mock data for users
  const usersData = [
    { 
      id: '1', 
      name: 'Emma Thompson', 
      email: 'emma@example.com', 
      lastActive: '2 hours ago', 
      riskScore: 0.86 
    },
    { 
      id: '2', 
      name: 'Michael Chen', 
      email: 'michael@example.com', 
      lastActive: '1 day ago', 
      riskScore: 0.72 
    },
    { 
      id: '3', 
      name: 'Sophia Rodriguez', 
      email: 'sophia@example.com', 
      lastActive: '3 days ago', 
      riskScore: 0.64 
    },
    { 
      id: '4', 
      name: 'James Wilson', 
      email: 'james@example.com', 
      lastActive: '5 hours ago', 
      riskScore: 0.43 
    },
    { 
      id: '5', 
      name: 'Olivia Davis', 
      email: 'olivia@example.com', 
      lastActive: '2 days ago', 
      riskScore: 0.22 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isSidebarOpen={isSidebarOpen} />
      
      <main className={`pt-20 px-4 pb-8 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Monitor and analyze your churn metrics</p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Pencil size={16} />
                Generate Report
              </Button>
              <Button className="gap-2">
                <Users size={16} />
                View All Users
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard 
              title="Active Users"
              value="2,846"
              change={4.3}
              isLoading={isLoading}
              icon={<Users size={18} />}
              className="animate-fade-up"
              description="Last 30 days"
            />
            <DashboardCard 
              title="Churn Rate"
              value="3.8%"
              change={-0.5}
              isLoading={isLoading}
              icon={<PercentSquare size={18} />}
              className="animate-fade-up"
              description="Last 30 days"
            />
            <DashboardCard 
              title="At-Risk Users"
              value="142"
              change={12}
              changeDirection="inverted"
              isLoading={isLoading}
              icon={<GitFork size={18} />}
              className="animate-fade-up"
              description="Predicted to churn"
            />
            <DashboardCard 
              title="Retention Rate"
              value="96.2%"
              change={0.8}
              isLoading={isLoading}
              icon={<Heart size={18} />}
              className="animate-fade-up"
              description="Last 30 days"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <ChartComponent 
                title="Monthly Churn Analysis" 
                data={monthlyChurnData} 
                type="area"
                isLoading={isLoading}
              />
            </div>
            <div>
              <ChurnMetrics 
                data={{
                  currentChurnRate: 3.8,
                  projectedChurnRate: 4.6,
                  industrialAverage: 5.2,
                  atRiskUsers: 142,
                  totalUsers: 2846
                }}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <UserRiskTable users={usersData} isLoading={isLoading} />
            </div>
            <div>
              <ChartComponent 
                title="Churn Reasons" 
                data={churnReasonData} 
                type="pie"
                isLoading={isLoading}
              />
            </div>
          </div>
          
          <div className="bg-brand/5 rounded-lg p-6 border border-brand/10 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium">Ready to integrate ChurnGuardian?</h3>
                <p className="text-muted-foreground mt-1">Follow our step-by-step guide to add tracking to your application</p>
              </div>
              <Button 
                onClick={() => navigate('/integration')}
                className="gap-2"
              >
                Integration Guide
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
