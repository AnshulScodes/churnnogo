
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Users, Settings, HelpCircle, Code, ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type SidebarProps = {
  isSidebarOpen: boolean;
};

const Sidebar = ({ isSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const [isHovering, setIsHovering] = useState(false);

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Integration', icon: Code, path: '/integration' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Users', icon: Users, path: '/users' },
  ];

  const bottomNavItems = [
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Help', icon: HelpCircle, path: '/help' },
  ];

  const NavItem = ({ item, isBottom = false }: { item: typeof navItems[0], isBottom?: boolean }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Link to={item.path} className="block">
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2 my-1 rounded-lg transition-all duration-300',
                isActive 
                  ? 'bg-brand/10 text-brand font-medium' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                !isSidebarOpen && 'justify-center',
                isBottom && !isSidebarOpen && 'mx-auto'
              )}
            >
              <Icon size={isSidebarOpen ? 18 : 20} className={cn(isActive && 'text-brand')} />
              {isSidebarOpen && (
                <span className="animate-fade-in">{item.label}</span>
              )}
              {isSidebarOpen && isActive && (
                <ChevronRight size={16} className="ml-auto text-brand" />
              )}
            </div>
          </Link>
        </TooltipTrigger>
        {!isSidebarOpen && (
          <TooltipContent side="right">
            {item.label}
          </TooltipContent>
        )}
      </Tooltip>
    );
  };

  return (
    <aside 
      className={cn(
        'fixed inset-y-0 left-0 z-50 bg-background border-r',
        'transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-64' : 'w-20',
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex flex-col h-full px-3 py-4">
        <div className={cn(
          "flex items-center mt-1 mb-6 transition-all duration-300",
          !isSidebarOpen && "justify-center"
        )}>
          {isSidebarOpen ? (
            <div className="flex items-center gap-2.5 px-2 animate-fade-in">
              <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center text-white font-semibold">CG</div>
              <span className="text-lg font-medium">ChurnGuardian</span>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center text-white font-semibold">
              CG
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 py-3">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        <div className="pt-4 border-t">
          {bottomNavItems.map((item) => (
            <NavItem key={item.path} item={item} isBottom />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
