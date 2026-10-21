import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const routeTitles = {
  '/': { title: 'Dashboard', subtitle: 'Overview & workspace' },
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview & workspace' },
  '/transactions': { title: 'Transactions', subtitle: 'Record and track sales, purchases, payments, and receipts' },
  '/vault': { title: 'Vault', subtitle: 'Purpose-driven savings wallets and dedicated target allocations' },
  '/segregation': { title: 'Vault', subtitle: 'Purpose-driven savings wallets and dedicated target allocations' },
  '/planner': { title: 'Planner', subtitle: 'Schedule and track upcoming cash flow commitments' },
  '/split-collect': { title: 'Split & Collect', subtitle: 'Divide group bills, assign shares, and track settlements' },
  '/people': { title: 'People Directory', subtitle: 'Manage customers, suppliers, and staff' },
  '/settings': { title: 'Settings', subtitle: 'Preferences & currency configuration' },
};

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const currentRoute = routeTitles[location.pathname] || {
    title: 'LedgerFlow',
    subtitle: 'Smart Ledger Management System',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 lg:hidden"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex flex-col">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {currentRoute.title}
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {currentRoute.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Theme Toggle & User Profile / Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Mode Switcher */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" />
          )}
        </Button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground leading-none">
              {user?.name || 'User'}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
              {user?.email}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1"
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
