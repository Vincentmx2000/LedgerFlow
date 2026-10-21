import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ArrowLeftRight,
  Landmark,
  CalendarClock,
  PieChart,
  Settings,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Dashboard = () => {
  const { user } = useAuth();
  const { currency, symbol } = useCurrency();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const modules = [
    {
      title: 'People Directory',
      description: 'Manage customers, suppliers, and staff records.',
      path: '/people',
      icon: Users,
      color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
    },
    {
      title: 'Transactions',
      description: 'Record sales, purchases, disbursements, and receipts.',
      path: '/transactions',
      icon: ArrowLeftRight,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    },
    {
      title: 'Vault',
      description: 'Allocate purpose-driven savings wallets and track funding ceilings.',
      path: '/vault',
      icon: Landmark,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10',
    },
    {
      title: 'Planner',
      description: 'Schedule future payments, collections, and financial commitments.',
      path: '/planner',
      icon: CalendarClock,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    },
    {
      title: 'Split & Collect',
      description: 'Split shared bills, track participant payments, and manage settlements.',
      path: '/split-collect',
      icon: PieChart,
      color: 'text-violet-600 dark:text-violet-400 bg-violet-500/10',
    },
    {
      title: 'Settings',
      description: 'Change currency preferences, theme mode, and profile info.',
      path: '/settings',
      icon: Settings,
      color: 'text-slate-600 dark:text-slate-400 bg-slate-500/10',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome Card */}
      <Card className="border-border">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Clock className="h-3.5 w-3.5" />
            <span>{currentDate}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name || 'User'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Welcome to LedgerFlow. Your smart ledger management workspace is ready. Active currency is set to <strong className="text-foreground">{currency} ({symbol})</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Module Navigation Grid */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Explore Modules
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.path} to={mod.path} className="group block">
                <Card className="h-full border-border transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-sm">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${mod.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mt-3">
                      {mod.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                      {mod.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <span className="text-xs font-medium text-primary inline-flex items-center gap-1 group-hover:underline">
                      Open {mod.title}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
