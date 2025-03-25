
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartProps {
  title: string;
  data: any[];
  type?: 'line' | 'area' | 'bar' | 'pie';
  isLoading?: boolean;
}

const ChartComponent: React.FC<ChartProps> = ({ 
  title, 
  data, 
  type = 'line',
  isLoading = false 
}) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'pie'>(type);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-[300px] w-full flex items-center justify-center bg-muted/30 rounded-lg animate-pulse-subtle">
          <p className="text-muted-foreground">Loading chart data...</p>
        </div>
      );
    }

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300} className="animate-fade-in">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none',
                  boxShadow: '0 2px 15px rgba(0, 0, 0, 0.08)',
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="churned" 
                stroke="#38BDF8" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorUv)" 
              />
              <Area 
                type="monotone" 
                dataKey="retained" 
                stroke="#10B981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPv)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300} className="animate-fade-in">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none',
                  boxShadow: '0 2px 15px rgba(0, 0, 0, 0.08)',
                  fontSize: '12px'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar 
                dataKey="churned" 
                fill="#38BDF8" 
                radius={[4, 4, 0, 0]} 
                name="Churned Users"
                animationDuration={1000}
              />
              <Bar 
                dataKey="retained" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]} 
                name="Retained Users"
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300} className="animate-fade-in">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height={300} className="animate-fade-in">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none',
                  boxShadow: '0 2px 15px rgba(0, 0, 0, 0.08)',
                  fontSize: '12px'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="churned" 
                stroke="#38BDF8" 
                strokeWidth={2}
                dot={{ stroke: '#38BDF8', strokeWidth: 2, r: 4, fill: 'white' }}
                activeDot={{ r: 6 }}
                name="Churned Users"
                animationDuration={1000}
              />
              <Line 
                type="monotone" 
                dataKey="retained" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ stroke: '#10B981', strokeWidth: 2, r: 4, fill: 'white' }}
                activeDot={{ r: 6 }}
                name="Retained Users"
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          
          <Tabs 
            value={chartType} 
            onValueChange={(v) => setChartType(v as any)}
            className="mt-1"
          >
            <TabsList className="bg-muted/60 p-0.5">
              <TabsTrigger 
                value="line" 
                className={cn(
                  "text-xs py-1 px-2",
                  chartType === 'line' ? 'bg-white shadow-sm' : 'hover:bg-transparent/5'
                )}
              >
                Line
              </TabsTrigger>
              <TabsTrigger 
                value="area" 
                className={cn(
                  "text-xs py-1 px-2",
                  chartType === 'area' ? 'bg-white shadow-sm' : 'hover:bg-transparent/5'
                )}
              >
                Area
              </TabsTrigger>
              <TabsTrigger 
                value="bar" 
                className={cn(
                  "text-xs py-1 px-2",
                  chartType === 'bar' ? 'bg-white shadow-sm' : 'hover:bg-transparent/5'
                )}
              >
                Bar
              </TabsTrigger>
              <TabsTrigger 
                value="pie" 
                className={cn(
                  "text-xs py-1 px-2",
                  chartType === 'pie' ? 'bg-white shadow-sm' : 'hover:bg-transparent/5'
                )}
              >
                Pie
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartComponent;
