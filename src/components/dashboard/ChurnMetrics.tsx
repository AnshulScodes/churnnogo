
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChurnMetricsProps {
  data: {
    currentChurnRate: number;
    projectedChurnRate: number;
    industrialAverage: number;
    atRiskUsers: number;
    totalUsers: number;
  };
  isLoading?: boolean;
}

const ChurnMetrics: React.FC<ChurnMetricsProps> = ({ 
  data, 
  isLoading = false 
}) => {
  const calculateSeverity = (rate: number): 'low' | 'medium' | 'high' => {
    if (rate < 5) return 'low';
    if (rate < 10) return 'medium';
    return 'high';
  };

  const severityColors = {
    low: 'bg-green-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
  };

  const currentSeverity = calculateSeverity(data.currentChurnRate);
  const projectedSeverity = calculateSeverity(data.projectedChurnRate);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Churn Metrics</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle size={16} className="text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-80 text-sm">
                Current churn rate is calculated based on lost customers over the last 30 days. 
                Projected churn rate is based on at-risk users identified by our prediction model.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-2 bg-muted rounded w-full" />
            <div className="h-6 bg-muted rounded w-1/3 mt-6" />
            <div className="h-2 bg-muted rounded w-full" />
            <div className="h-20 bg-muted rounded w-full mt-6" />
          </div>
        ) : (
          <>
            <div className="space-y-2 animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    severityColors[currentSeverity]
                  )} />
                  <span className="text-sm font-medium">Current Churn Rate</span>
                </div>
                <span className="text-sm font-medium">{data.currentChurnRate}%</span>
              </div>
              <Progress 
                value={data.currentChurnRate * 5} 
                className={cn(
                  "h-2",
                  currentSeverity === 'low' && "bg-green-100",
                  currentSeverity === 'medium' && "bg-amber-100",
                  currentSeverity === 'high' && "bg-red-100"
                )}
                indicatorClassName={severityColors[currentSeverity]}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Industry avg: {data.industrialAverage}%</span>
                <span>Goal: 3%</span>
              </div>
            </div>

            <div className="space-y-2 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    severityColors[projectedSeverity]
                  )} />
                  <span className="text-sm font-medium">Projected Churn Rate</span>
                </div>
                <span className="text-sm font-medium">{data.projectedChurnRate}%</span>
              </div>
              <Progress 
                value={data.projectedChurnRate * 5} 
                className={cn(
                  "h-2",
                  projectedSeverity === 'low' && "bg-green-100",
                  projectedSeverity === 'medium' && "bg-amber-100",
                  projectedSeverity === 'high' && "bg-red-100"
                )}
                indicatorClassName={severityColors[projectedSeverity]}
              />
            </div>

            <div className="pt-3 mt-3 border-t animate-fade-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center bg-amber-50 p-3 rounded-lg border border-amber-100">
                <AlertCircle className="text-amber-500 h-6 w-6 mr-3 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-amber-900">
                    {data.atRiskUsers} users at risk of churning
                  </div>
                  <div className="text-xs text-amber-800 mt-0.5">
                    {Math.round((data.atRiskUsers / data.totalUsers) * 100)}% of your user base. 
                    <a href="#" className="font-medium ml-1 hover:text-amber-900 underline-offset-4 hover:underline">
                      View users
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChurnMetrics;
