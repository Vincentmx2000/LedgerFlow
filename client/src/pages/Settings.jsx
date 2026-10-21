import React, { useState } from 'react';
import {
  Coins,
  CheckCircle2,
  Building,
  User,
  Mail,
  Shield,
  Palette,
  Sun,
  Moon,
  Laptop,
  Check,
  Save,
  AlertCircle,
  RefreshCw,
  Globe,
  Sliders,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const Settings = () => {
  const { user, updateUser } = useAuth();
  const {
    currency,
    symbol,
    currencyConfig,
    setCurrency,
    formatAmount,
    supportedCurrencies,
  } = useCurrency();
  const { theme, toggleTheme, setTheme } = useTheme();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  const handleCurrencySelect = async (newCode) => {
    if (newCode === currency) return;
    const res = await setCurrency(newCode);
    if (res.success) {
      showFeedback('success', `Currency changed to ${newCode} (${symbol}) successfully!`);
    } else {
      showFeedback('error', res.message || 'Failed to update currency');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await api.updateProfile(profileData);
      if (res.success) {
        updateUser(res.user);
        showFeedback('success', 'Organization profile updated successfully');
      }
    } catch (err) {
      showFeedback('error', err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2",
            feedback.type === 'success'
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Settings & Preferences
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage currency settings, organization profile, themes, and ledger preferences.
        </p>
      </div>

      {/* 1. CURRENCY PREFERENCES (PRIMARY SECTION) */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span>Base Currency Configuration</span>
              </CardTitle>
              <CardDescription>
                Choose the standard currency for all vouchers, financial cards, splits, and transaction entries.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 gap-1.5">
              <span>Current:</span>
              <strong className="text-primary font-bold">{currency} ({symbol})</strong>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Live Formatting Preview Banner */}
          <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Live Currency Preview
                </span>
                <div className="text-2xl font-bold font-mono tracking-tight text-foreground mt-0.5">
                  {formatAmount(148500.5)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Format based on {currencyConfig.name} ({currencyConfig.locale}) standards.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md border border-border bg-background px-2.5 py-1 font-mono">
                  Symbol: <strong>{symbol}</strong>
                </span>
                <span className="rounded-md border border-border bg-background px-2.5 py-1 font-mono">
                  Code: <strong>{currency}</strong>
                </span>
                <span className="rounded-md border border-border bg-background px-2.5 py-1 font-mono">
                  Region: <strong>{currencyConfig.country}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Currency Grid Picker */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Operating Currency
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {supportedCurrencies.map((c) => {
                const isSelected = currency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCurrencySelect(c.code)}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-lg border text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                        : "border-border bg-card hover:bg-accent hover:border-border/80"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-md font-mono text-base font-bold",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        {c.symbol}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-foreground">
                            {c.code}
                          </span>
                          {c.code === 'INR' && (
                            <Badge variant="secondary" className="text-[10px] py-0 px-1 font-medium">
                              Default
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {c.name}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. USER PROFILE SETTINGS */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <span>User Profile</span>
          </CardTitle>
          <CardDescription>
            Update your account display name and view your registered email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="userName"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Jane Doe"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">Registered Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="userEmail"
                    value={user?.email || 'admin@ledgerflow.io'}
                    disabled
                    className="pl-9 bg-muted/50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={isUpdatingProfile} className="gap-2">
                <Save className="h-4 w-4" />
                <span>{isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 3. APPEARANCE & THEME PREFERENCES */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <span>Appearance & Theme</span>
          </CardTitle>
          <CardDescription>
            Switch between crisp shadcn Light Mode and sleek Dark Mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border text-left transition-all",
                theme === 'light'
                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                  : "border-border bg-card hover:bg-accent"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-shrink-0">
                <Sun className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Light Mode</h4>
                  {theme === 'light' && (
                    <Badge variant="default" className="text-[10px] py-0 px-1.5">
                      Active Default
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Clean white background with crisp typography and subtle slate borders.
                </p>
              </div>
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border text-left transition-all",
                theme === 'dark'
                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                  : "border-border bg-card hover:bg-accent"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex-shrink-0">
                <Moon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Dark Mode</h4>
                  {theme === 'dark' && (
                    <Badge variant="default" className="text-[10px] py-0 px-1.5">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Deep charcoal surfaces with high-contrast text and neon accent badges.
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
