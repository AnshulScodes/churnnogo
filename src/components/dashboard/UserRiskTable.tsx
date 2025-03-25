
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown, Mail, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  riskScore: number;
  avatar?: string;
}

interface UserRiskTableProps {
  users: User[];
  isLoading?: boolean;
}

const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
  if (score < 0.3) return 'low';
  if (score < 0.7) return 'medium';
  return 'high';
};

const UserRiskTable: React.FC<UserRiskTableProps> = ({ users, isLoading = false }) => {
  const [sortBy, setSortBy] = useState<'name' | 'lastActive' | 'riskScore'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: 'name' | 'lastActive' | 'riskScore') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    if (sortBy === 'name') {
      return multiplier * a.name.localeCompare(b.name);
    } else if (sortBy === 'lastActive') {
      return multiplier * (new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime());
    } else {
      return multiplier * (a.riskScore - b.riskScore);
    }
  });

  const placeholders = Array(5).fill(0);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-card">
      <CardHeader className="pb-3">
        <CardTitle>At-Risk Users</CardTitle>
        <CardDescription>Users with high probability of churning soon</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('lastActive')}
                  className="flex items-center gap-1 -ml-3 font-medium"
                >
                  Last Active
                  <ArrowUpDown size={14} />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('riskScore')}
                  className="flex items-center gap-1 -ml-3 font-medium"
                >
                  Risk Score
                  <ArrowUpDown size={14} />
                </Button>
              </TableHead>
              <TableHead className="w-14"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              placeholders.map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-8 w-8 bg-muted rounded" /></TableCell>
                </TableRow>
              ))
            ) : (
              sortedUsers.map((user, index) => {
                const riskLevel = getRiskLevel(user.riskScore);
                const riskColor = {
                  low: "bg-green-100 text-green-800 hover:bg-green-200",
                  medium: "bg-amber-100 text-amber-800 hover:bg-amber-200",
                  high: "bg-red-100 text-red-800 hover:bg-red-200"
                };
                
                return (
                  <TableRow 
                    key={user.id} 
                    className={cn(
                      "transition-colors animate-fade-in",
                      {"animate-fade-up": index < 3}
                    )} 
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.lastActive}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "font-medium text-xs",
                          riskColor[riskLevel]
                        )}
                      >
                        {Math.round(user.riskScore * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            <Mail className="mr-2 h-4 w-4" />
                            Send email
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Activity className="mr-2 h-4 w-4" />
                            View activity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserRiskTable;
