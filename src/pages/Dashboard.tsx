
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

  // Fetch events count for user activity
  const { data: eventsData, isLoading: isEventsLoading } = useQuery({
    queryKey: ['events', activeClient?.id],
    queryFn: async () => {
      if (!activeClient?.id) return { count: 0, eventTypes: {} };
      
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', activeClient.id);
      
      if (error) throw error;
      
      // Get event types distribution
      const { data: eventTypesData, error: eventTypesError } = await supabase
        .from('events')
        .select('event_type')
        .eq('client_id', activeClient.id);
        
      const eventTypes = {};
      if (eventTypesData) {
        eventTypesData.forEach(event => {
          eventTypes[event.event_type] = (eventTypes[event.event_type] || 0) + 1;
        });
      }
      
      return { 
        count: count || 0,
        eventTypes
      };
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
      
      const { data: predictionsData, error: predictionsError } = await supabase
        .from('predictions')
        .select('id, user_id, risk_score, risk_factors, created_at')
        .eq('client_id', activeClient.id)
        .gt('risk_score', 0.5) // Risk score > 0.5 (50%)
        .order('risk_score', { ascending: false })
        .limit(5);
      
      if (predictionsError) throw predictionsError;
      
      const usersWithActivity = await Promise.all(predictionsData.map(async (prediction) => {
        const { data: userProfile, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('last_active')
          .eq('client_id', activeClient.id)
          .eq('user_id', prediction.user_id)
          .single();
        
        const lastActive = userProfileError ? new Date().toISOString() : userProfile?.last_active;
        
        return {
          id: prediction.id,
          name: `User ${prediction.user_id.substring(0, 8)}`,
          email: `user${prediction.user_id.substring(0, 4)}@example.com`,
          lastActive: formatLastActive(lastActive),
          riskScore: prediction.risk_score
        };
      }));
      
      return usersWithActivity;
    },
    enabled: !!activeClient?.id
  });

  // Fetch monthly churn data based on actual predictions
  const { data: monthlyChurnData, isLoading: isMonthlyChurnLoading } = useQuery({
    queryKey: ['monthlyChurn', activeClient?.id],
    queryFn: async () => {
      if (!activeClient?.id) {
        // Return sample data if no client
        return generateMonthlyChurnSampleData();
      }
      
      const { data: predictionsData, error: predictionsError } = await supabase
        .from('predictions')
        .select('risk_score, created_at')
        .eq('client_id', activeClient.id);
      
      if (predictionsError || !predictionsData || predictionsData.length === 0) {
        // Return sample data if error or no data
        return generateMonthlyChurnSampleData();
      }
      
      // Group predictions by month and calculate average churn rate
      const monthlyData = groupPredictionsByMonth(predictionsData);
      return monthlyData;
    },
    enabled: !!activeClient?.id
  });

  // Fetch churn reasons data from risk_factors
  const { data: churnReasonData, isLoading: isChurnReasonLoading } = useQuery({
    queryKey: ['churnReasons', activeClient?.id],
    queryFn: async () => {
      if (!activeClient?.id) {
        // Return sample data if no client
        return generateChurnReasonsSampleData();
      }
      
      const { data: predictionsData, error: predictionsError } = await supabase
        .from('predictions')
        .select('risk_factors')
        .eq('client_id', activeClient.id)
        .gt('risk_score', 0.5);
      
      if (predictionsError || !predictionsData || predictionsData.length === 0) {
        // Return sample data if error or no data
        return generateChurnReasonsSampleData();
      }
      
      // Extract and aggregate risk factors
      const reasons = aggregateRiskFactors(predictionsData);
      return reasons;
    },
    enabled: !!activeClient?.id
  });

  // Helper function to generate sample monthly churn data
  const generateMonthlyChurnSampleData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    return months.map(name => ({
      name,
      churned: Math.random() * 8 + 2, // Random value between 2-10
      retained: 100 - (Math.random() * 8 + 2)
    }));
  };

  // Helper function to generate sample churn reasons data
  const generateChurnReasonsSampleData = () => {
    return [
      { name: 'Price', value: 35 },
      { name: 'Features', value: 25 },
      { name: 'UX Issues', value: 20 },
      { name: 'Competition', value: 15 },
      { name: 'Other', value: 5 },
    ];
  };

  // Helper function to group predictions by month
  const groupPredictionsByMonth = (predictionsData) => {
    const months = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    predictionsData.forEach(pred => {
      const date = new Date(pred.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = monthNames[date.getMonth()];
      
      if (!months[monthKey]) {
        months[monthKey] = {
          name: monthName,
          totalScore: 0,
          count: 0
        };
      }
      
      months[monthKey].totalScore += pred.risk_score;
      months[monthKey].count += 1;
    });
    
    // Convert to array and calculate average churn rate
    return Object.values(months).map((month: any) => {
      const avgChurnRate = (month.totalScore / month.count) * 100;
      return {
        name: month.name,
        churned: parseFloat(avgChurnRate.toFixed(1)),
        retained: parseFloat((100 - avgChurnRate).toFixed(1))
      };
    });
  };

  // Helper function to extract and aggregate risk factors
  const aggregateRiskFactors = (predictionsData) => {
    const factorCounts = {};
    let totalFactors = 0;
    
    predictionsData.forEach(pred => {
      const factors = pred.risk_factors || {};
      
      Object.keys(factors).forEach(factor => {
        if (!factorCounts[factor]) {
          factorCounts[factor] = 0;
        }
        factorCounts[factor] += 1;
        totalFactors += 1;
      });
    });
    
    // Convert to array and calculate percentages
    return Object.keys(factorCounts).map(name => {
      const percentage = Math.round((factorCounts[name] / totalFactors) * 100);
      return {
        name: formatRiskFactorName(name),
        value: percentage || 1 // Ensure at least 1% for visibility
      };
    }).sort((a, b) => b.value - a.value);
  };

  // Format risk factor names for display
  const formatRiskFactorName = (key) => {
    if (!key) return 'Unknown';
    
    // Convert snake_case or camelCase to Title Case with spaces
    return key
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
      .trim();
  };

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
                   isAtRiskUsersLoading || isMonthlyChurnLoading || isChurnReasonLoading ||
                   isEventsLoading;

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
              title="Total Events"
              value={isEventsLoading ? "..." : eventsData?.count.toString() || "0"}
              change={8.2}
              isLoading={isLoading}
              icon={<Activity size={18} />}
              className="animate-fade-up"
              description="User interactions"
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
