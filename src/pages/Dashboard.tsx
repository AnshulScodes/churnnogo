
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Users, BarChart, ArrowRight, MessageSquare, PercentSquare, GitFork, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ChurnMetrics from '@/components/dashboard/ChurnMetrics';
import UserRiskTable from '@/components/dashboard/UserRiskTable';
import ChartComponent from '@/components/dashboard/ChartComponent';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Fetch clients data
  const { data: clientsData, isLoading: isClientsLoading, error: clientsError } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, api_key, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Use the first client if available
  const activeClient = clientsData && clientsData.length > 0 ? clientsData[0] : null;

  // Fetch user profiles count
  const { data: userProfilesData, isLoading: isUserProfilesLoading } = useQuery({
    queryKey: ['userProfiles', activeClient?.id],
    queryFn: async () => {
      if (!activeClient?.id) return { count: 0 };
      
      const { count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', activeClient.id);
      
      if (error) throw error;
      return { count: count || 0 };
    },
    enabled: !!activeClient?.id
  });

  // Fetch churn predictions data
  const { data: predictionsData, isLoading: isPredictionsLoading } = useQuery({
    queryKey: ['predictions', activeClient?.id],
    queryFn: async () => {
      if (!activeClient?.id) return [];
      
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('client_id', activeClient.id)
        .order('risk_score', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeClient?.id
  });

  // Fetch at-risk users (users with high risk scores)
  const { data: atRiskUsers, isLoading: isAtRiskUsersLoading } = useQuery({
    queryKey: ['atRiskUsers', activeClient?.id],
    queryFn: async () => {
      if (!activeClient?.id) return [];
      
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          id, 
          user_id, 
          risk_score, 
          risk_factors, 
          created_at,
          user_profiles!inner(last_active)
        `)
        .eq('client_id', activeClient.id)
        .gt('risk_score', 0.5) // Risk score > 0.5 (50%)
        .order('risk_score', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Transform data for the table component
      return data.map(item => ({
        id: item.id,
        name: `User ${item.user_id.substring(0, 8)}`,
        email: `user${item.user_id.substring(0, 4)}@example.com`,
        lastActive: formatLastActive(item.user_profiles.last_active),
        riskScore: item.risk_score
      }));
    },
    enabled: !!activeClient?.id
  });

  // Fetch monthly churn data
  const { data: monthlyChurnData, isLoading: isMonthlyChurnLoading } = useQuery({
    queryKey: ['monthlyChurn', activeClient?.id],
    queryFn: async () => {
      // In a real implementation, this would fetch actual monthly data
      // For now, generate sample data
      return [
        { name: 'Jan', churned: 5.2, retained: 94.8 },
        { name: 'Feb', churned: 4.8, retained: 95.2 },
        { name: 'Mar', churned: 6.3, retained: 93.7 },
        { name: 'Apr', churned: 7.1, retained: 92.9 },
        { name: 'May', churned: 6.5, retained: 93.5 },
        { name: 'Jun', churned: 4.2, retained: 95.8 },
        { name: 'Jul', churned: 3.8, retained: 96.2 },
        { name: 'Aug', churned: 3.2, retained: 96.8 },
      ];
    }
  });

  // Fetch churn reasons data
  const { data: churnReasonData, isLoading: isChurnReasonLoading } = useQuery({
    queryKey: ['churnReasons', activeClient?.id],
    queryFn: async () => {
      // In a real implementation, this would analyze risk factors
      // For now, generate sample data
      return [
        { name: 'Price', value: 35 },
        { name: 'Features', value: 25 },
        { name: 'UX Issues', value: 20 },
        { name: 'Competition', value: 15 },
        { name: 'Other', value: 5 },
      ];
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Calculate average churn rate from predictions
  const calculateChurnRate = (predictions) => {
    if (!predictions || predictions.length === 0) return 3.8; // Default
    
    // Consider users with risk score > 0.6 as likely to churn
    const likelyToChurnCount = predictions.filter(p => p.risk_score > 0.6).length;
    const churnRate = (likelyToChurnCount / predictions.length) * 100;
    
    return parseFloat(churnRate.toFixed(1));
  };

  // Calculate projected churn rate
  const calculateProjectedChurnRate = (predictions) => {
    if (!predictions || predictions.length === 0) return 4.6; // Default
    
    // For projected, use weighted average of all risk scores
    const totalRiskScore = predictions.reduce((sum, p) => sum + p.risk_score, 0);
    const avgRiskScore = totalRiskScore / predictions.length;
    
    // Convert to percentage and add a small factor to account for future uncertainty
    const projectedRate = (avgRiskScore * 100) * 1.2;
    
    return parseFloat(projectedRate.toFixed(1));
  };

  // Format last active date
  function formatLastActive(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  }

  // Combined loading state for UI components
  const isLoading = isClientsLoading || isUserProfilesLoading || isPredictionsLoading || 
                   isAtRiskUsersLoading || isMonthlyChurnLoading || isChurnReasonLoading;

  // Handle errors
  useEffect(() => {
    if (clientsError) {
      toast.error('Error loading dashboard data');
      console.error('Error fetching clients:', clientsError);
    }
  }, [clientsError]);

  return (
    <div className="min-h-screen bg-background">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isSidebarOpen={isSidebarOpen} />
      
      <main className={`pt-20 px-4 pb-8 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                {activeClient 
                  ? `Monitoring churn metrics for ${activeClient.name}`
                  : 'Create a client to start monitoring churn metrics'
                }
              </p>
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
              value={isUserProfilesLoading ? "..." : userProfilesData?.count.toString() || "0"}
              change={4.3}
              isLoading={isLoading}
              icon={<Users size={18} />}
              className="animate-fade-up"
              description="Last 30 days"
            />
            <DashboardCard 
              title="Churn Rate"
              value={isPredictionsLoading ? "..." : `${calculateChurnRate(predictionsData)}%`}
              change={-0.5}
              isLoading={isLoading}
              icon={<PercentSquare size={18} />}
              className="animate-fade-up"
              description="Last 30 days"
            />
            <DashboardCard 
              title="At-Risk Users"
              value={isPredictionsLoading ? "..." : (predictionsData?.filter(p => p.risk_score > 0.6).length.toString() || "0")}
              change={12}
              changeDirection="inverted"
              isLoading={isLoading}
              icon={<GitFork size={18} />}
              className="animate-fade-up"
              description="Predicted to churn"
            />
            <DashboardCard 
              title="Retention Rate"
              value={isPredictionsLoading ? "..." : `${100 - calculateChurnRate(predictionsData)}%`}
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
                data={monthlyChurnData || []} 
                type="area"
                isLoading={isLoading}
              />
            </div>
            <div>
              <ChurnMetrics 
                data={{
                  currentChurnRate: calculateChurnRate(predictionsData),
                  projectedChurnRate: calculateProjectedChurnRate(predictionsData),
                  industrialAverage: 5.2,
                  atRiskUsers: predictionsData?.filter(p => p.risk_score > 0.6).length || 0,
                  totalUsers: userProfilesData?.count || 0
                }}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <UserRiskTable users={atRiskUsers || []} isLoading={isLoading} />
            </div>
            <div>
              <ChartComponent 
                title="Churn Reasons" 
                data={churnReasonData || []} 
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
