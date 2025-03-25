
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  change?: number;
  changeDirection?: 'positive' | 'negative' | 'neutral' | 'inverted';
  isLoading?: boolean;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  description,
  icon,
  change,
  changeDirection = 'positive',
  isLoading = false,
  className,
}) => {
  const getChangeColor = () => {
    if (change === undefined || change === 0) return 'text-muted-foreground';
    
    if (changeDirection === 'inverted') {
      return change > 0 ? 'text-red-500' : 'text-green-500';
    } 
    
    if (changeDirection === 'neutral') {
      return 'text-muted-foreground';
    }
    
    return change > 0 
      ? 'text-green-500' 
      : 'text-red-500';
  };

  const getChangeIcon = () => {
    if (change === undefined || change === 0) return null;
    
    const isPositive = (changeDirection === 'inverted') 
      ? change < 0 
      : change > 0;

    return isPositive 
      ? <ArrowUpIcon className="w-3 h-3" /> 
      : <ArrowDownIcon className="w-3 h-3" />;
  };

  return (
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-9 w-3/4 bg-muted rounded animate-pulse-subtle" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse-subtle" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-semibold animate-fade-in">
              {value}
            </div>
            {(description || change !== undefined) && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                {change !== undefined && (
                  <span className={cn("flex items-center", getChangeColor())}>
                    {getChangeIcon()}
                    {Math.abs(change)}%
                  </span>
                )}
                {description && (
                  <>
                    {change !== undefined && <span className="mx-1">•</span>}
                    <span>{description}</span>
                  </>
                )}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
