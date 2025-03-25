
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type HeaderProps = {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
};

const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header 
      className={cn(
        'fixed top-0 right-0 left-0 z-40 transition-all duration-300 ease-in-out backdrop-blur-md',
        scrolled ? 'bg-white/80 shadow-subtle' : 'bg-transparent',
        isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
      )}
    >
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          
          <div className="hidden md:block animate-fade-in">
            {location.pathname === '/' && <h1 className="text-lg font-medium">Welcome</h1>}
            {location.pathname === '/dashboard' && <h1 className="text-lg font-medium">Dashboard</h1>}
            {location.pathname === '/integration' && <h1 className="text-lg font-medium">Integration Guide</h1>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {searchVisible ? (
            <div className="relative max-w-md animate-fade-in">
              <Input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 w-full rounded-full bg-muted/70"
                autoFocus
                onBlur={() => setSearchVisible(false)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSearchVisible(true)}
              className="rounded-full"
            >
              <Search size={18} />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full relative"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full" />
          </Button>
          
          <div className="h-8 w-px bg-border mx-1" />
          
          <Avatar className="h-9 w-9 transition-all duration-300 hover:ring-2 hover:ring-brand/20">
            <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
