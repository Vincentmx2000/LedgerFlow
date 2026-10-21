import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  Coins,
  Target,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  DollarSign,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '@/services/api';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = ['All', 'In Progress', 'Target Met', 'Claimed'];

const STATUS_CONFIG = {
  'In Progress': {
    label: 'In Progress',
    badgeVariant: 'outline',
    badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400 font-semibold',
    icon: Clock,
    barColor: 'bg-primary',
  },
  'Target Met': {
    label: 'Target Met',
    badgeVariant: 'outline',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold',
    icon: CheckCircle2,
    barColor: 'bg-emerald-500',
  },
  'Claimed': {
    label: 'Claimed',
    badgeVariant: 'outline',
    badgeClass: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400 font-semibold',
    icon: Archive,
    barColor: 'bg-purple-500',
  },
};

export function Vault() {
  const { symbol, currency, formatAmount } = useCurrency();

  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [addCashTarget, setAddCashTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form states - Create Vault
  const [createForm, setCreateForm] = useState({
    name: '',
    targetAmount: '',
    description: '',
    initialAllocated: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Form states - Add Cash
  const [cashAmount, setCashAmount] = useState('');
  const [isAddingCash, setIsAddingCash] = useState(false);
  const [addCashError, setAddCashError] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ text: message, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === message ? null : prev));
    }, 4000);
  };

  const loadVaults = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getVaults();
      setVaults(res.data || []);
    } catch (err) {
      console.error('Failed to load vaults:', err);
      setError(err.message || 'Failed to fetch vaults');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaults();
  }, []);

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    let totalAllocated = 0;
    let totalTarget = 0;
    let activeCount = 0;
    let inProgressCount = 0;
    let targetMetCount = 0;
    let claimedCount = 0;

    vaults.forEach((v) => {
      const allocated = Number(v.currentAllocated || 0);
      const target = Number(v.targetAmount || 0);

      totalAllocated += allocated;
      totalTarget += target;

      if (v.status === 'In Progress') {
        inProgressCount++;
        activeCount++;
      } else if (v.status === 'Target Met') {
        targetMetCount++;
        activeCount++;
      } else if (v.status === 'Claimed') {
        claimedCount++;
      }
    });

    const accomplishmentPercent =
      totalTarget > 0 ? Math.min(100, (totalAllocated / totalTarget) * 100) : 0;

    return {
      totalAllocated,
      totalTarget,
      activeCount,
      inProgressCount,
      targetMetCount,
      claimedCount,
      accomplishmentPercent,
    };
  }, [vaults]);

  // Filtered Vaults list
  const filteredVaults = useMemo(() => {
    return vaults.filter((v) => {
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [vaults, statusFilter, searchQuery]);

  // Create Vault handler
  const handleCreateVault = async (e) => {
    e.preventDefault();
    setCreateError(null);

    if (!createForm.name.trim()) {
      setCreateError('Please enter a vault name');
      return;
    }

    const numericTarget = parseFloat(createForm.targetAmount);
    if (isNaN(numericTarget) || numericTarget <= 0) {
      setCreateError('Please enter a target ceiling greater than 0');
      return;
    }

    const numericInitial = parseFloat(createForm.initialAllocated) || 0;
    if (numericInitial < 0) {
      setCreateError('Initial allocation cannot be negative');
      return;
    }

    try {
      setIsCreating(true);
      const res = await api.createVault({
        name: createForm.name.trim(),
        targetAmount: numericTarget,
        description: createForm.description.trim(),
        currentAllocated: numericInitial,
      });

      setVaults((prev) => [res.data, ...prev]);
      showToast(`Vault '${res.data.name}' created successfully!`);
      setIsCreateOpen(false);
      setCreateForm({
        name: '',
        targetAmount: '',
        description: '',
        initialAllocated: '',
      });
    } catch (err) {
      console.error('Failed to create vault:', err);
      setCreateError(err.message || 'Failed to create vault');
    } finally {
      setIsCreating(false);
    }
  };

  // Add Cash handler
  const handleAddCash = async (e) => {
    e.preventDefault();
    setAddCashError(null);

    if (!addCashTarget) return;

    const numericAmount = parseFloat(cashAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAddCashError('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setIsAddingCash(true);
      const res = await api.addCashToVault(addCashTarget._id, numericAmount);

      setVaults((prev) =>
        prev.map((v) => (v._id === addCashTarget._id ? res.data : v))
      );

      const targetReached =
        res.data.status === 'Target Met' && addCashTarget.status === 'In Progress';

      showToast(
        targetReached
          ? `🎉 Goal reached! Added ${formatAmount(numericAmount)} to '${res.data.name}'. Target Met!`
          : `Added ${formatAmount(numericAmount)} to '${res.data.name}'`
      );

      setAddCashTarget(null);
      setCashAmount('');
    } catch (err) {
      console.error('Failed to add cash:', err);
      setAddCashError(err.message || 'Failed to allocate funds');
    } finally {
      setIsAddingCash(false);
    }
  };

  // Mark as Claimed handler
  const handleClaimVault = async (vault) => {
    try {
      const res = await api.markVaultClaimed(vault._id);
      setVaults((prev) =>
        prev.map((v) => (v._id === vault._id ? res.data : v))
      );
      showToast(`Vault '${vault.name}' has been marked as Claimed.`);
    } catch (err) {
      console.error('Failed to claim vault:', err);
      showToast(err.message || 'Failed to mark vault as Claimed', 'error');
    }
  };

  // Delete Vault handler
  const handleDeleteVault = async () => {
    if (!deleteTarget) return;

    try {
      await api.deleteVault(deleteTarget._id);
      setVaults((prev) => prev.filter((v) => v._id !== deleteTarget._id));
      showToast(`Vault '${deleteTarget.name}' deleted`);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete vault:', err);
      showToast(err.message || 'Failed to delete vault');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-2xl animate-in slide-in-from-bottom-3 duration-200',
            toastMessage.type === 'error'
              ? 'border-destructive/40 bg-destructive/15 text-destructive dark:bg-destructive/25'
              : 'border-border bg-card text-foreground'
          )}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          )}
          <span>{toastMessage.text || toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Vault
            </h1>
            <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
              {currency} ({symbol})
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Purpose-driven financial savings wallets, goal progress, and dedicated fund allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadVaults}
            disabled={loading}
            className="gap-1.5"
            title="Refresh Vaults"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setCreateError(null);
              setIsCreateOpen(true);
            }}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create Vault</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards Grid (Active Vaults, Total Allocated, Combined Target, Accomplishment %) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Vaults */}
        <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Vaults
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Landmark className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold font-mono text-foreground">
              {metrics.activeCount}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span>{metrics.inProgressCount} in progress</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {metrics.targetMetCount} target met
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Allocated Funds */}
        <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Allocated Funds
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatAmount(metrics.totalAllocated)}
            </div>
            <p className="text-xs text-muted-foreground">
              Saved across {vaults.length} total {vaults.length === 1 ? 'vault' : 'vaults'}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Combined Target Amount */}
        <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Combined Target Amount
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Target className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold font-mono text-foreground">
              {formatAmount(metrics.totalTarget)}
            </div>
            <p className="text-xs text-muted-foreground">
              Aggregate funding ceiling
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Overall Target Accomplishment % */}
        <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overall Accomplishment
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold font-mono text-foreground">
                {metrics.accomplishmentPercent.toFixed(1)}%
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                {formatAmount(Math.max(0, metrics.totalTarget - metrics.totalAllocated))} needed
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${Math.min(100, metrics.accomplishmentPercent)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map((s) => {
            const count =
              s === 'All'
                ? vaults.length
                : vaults.filter((v) => v.status === s).length;
            const isSelected = statusFilter === s;

            return (
              <Button
                key={s}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'h-8 text-xs font-medium rounded-full px-3 gap-1.5 transition-all',
                  !isSelected && 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{s}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-mono',
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vaults..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadVaults}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && vaults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">Loading your vaults...</p>
          <p className="text-xs text-muted-foreground">Calculating fund balances and goal milestones</p>
        </div>
      ) : filteredVaults.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed border-border py-16 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Landmark className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                {searchQuery || statusFilter !== 'All'
                  ? 'No matching vaults found'
                  : 'No vaults created yet'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {searchQuery || statusFilter !== 'All'
                  ? 'Try clearing your search query or switching status filters.'
                  : 'Start allocating savings towards specific business goals, tax provisions, or emergency reserves.'}
              </p>
            </div>
            {searchQuery || statusFilter !== 'All' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Vault</span>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Vault Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVaults.map((vault) => {
            const current = Number(vault.currentAllocated || 0);
            const target = Number(vault.targetAmount || 0);
            const percent = target > 0 ? (current / target) * 100 : 0;
            const cappedPercent = Math.min(100, Math.max(0, percent));
            const remaining = Math.max(0, target - current);
            const statusConfig = STATUS_CONFIG[vault.status] || STATUS_CONFIG['In Progress'];
            const StatusIcon = statusConfig.icon;

            const isTargetMet = vault.status === 'Target Met';
            const isClaimed = vault.status === 'Claimed';

            return (
              <Card
                key={vault._id}
                className={cn(
                  'border-border shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-foreground/20',
                  isTargetMet && 'border-emerald-500/40 dark:border-emerald-500/30',
                  isClaimed && 'opacity-85 bg-muted/20'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-md',
                            isTargetMet
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : isClaimed
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                              : 'bg-primary/10 text-primary'
                          )}
                        >
                          <Landmark className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-base font-semibold leading-tight text-foreground line-clamp-1">
                          {vault.name}
                        </CardTitle>
                      </div>
                    </div>

                    <Badge
                      variant={statusConfig.badgeVariant}
                      className={cn('text-[11px] gap-1 px-2 py-0.5 whitespace-nowrap', statusConfig.badgeClass)}
                    >
                      <StatusIcon className="h-3 w-3" />
                      <span>{statusConfig.label}</span>
                    </Badge>
                  </div>

                  {vault.description ? (
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1.5">
                      {vault.description}
                    </CardDescription>
                  ) : (
                    <CardDescription className="text-xs text-muted-foreground italic mt-1.5">
                      No description provided
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3.5 pb-4">
                  {/* Saved Allocated vs Target Ceiling */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium block">
                        Saved Allocated
                      </span>
                      <span className="text-xl font-bold font-mono text-foreground">
                        {formatAmount(current)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium block">
                        Target Ceiling
                      </span>
                      <span className="text-sm font-semibold font-mono text-muted-foreground">
                        {formatAmount(target)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Goal Status % */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <span>Goal Status</span>
                        {percent >= 100 && (
                          <Sparkles className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                        )}
                      </span>
                      <span
                        className={cn(
                          'font-mono font-bold',
                          isTargetMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                        )}
                      >
                        {percent.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-500 rounded-full',
                          statusConfig.barColor
                        )}
                        style={{ width: `${cappedPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {isClaimed
                          ? 'Vault claimed & archived'
                          : isTargetMet
                          ? 'Target fully accomplished!'
                          : `${formatAmount(remaining)} remaining`}
                      </span>
                      {percent > 100 && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                          +{formatAmount(current - target)} over ceiling
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Mark as Claimed button: enabled for Target Met, disabled with tooltip for In Progress, hidden for Claimed */}
                    {!isClaimed && (
                      isTargetMet ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClaimVault(vault)}
                          className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400 font-medium"
                          title="Mark vault as Claimed"
                        >
                          <Archive className="h-3.5 w-3.5 mr-1" />
                          <span>Claim</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled
                          className="h-8 text-xs text-muted-foreground/50 opacity-60 cursor-not-allowed"
                          title="Reach the target to claim"
                        >
                          <Archive className="h-3.5 w-3.5 mr-1" />
                          <span>Claim</span>
                        </Button>
                      )
                    )}

                    {/* Delete button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(vault)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete Vault"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Add Cash button */}
                  <Button
                    size="sm"
                    onClick={() => {
                      setAddCashTarget(vault);
                      setCashAmount('');
                      setAddCashError(null);
                    }}
                    disabled={isClaimed}
                    className="h-8 text-xs gap-1 font-medium shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Cash</span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE VAULT MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Landmark className="h-5 w-5 text-primary" />
              <span>Create Purpose Vault</span>
            </DialogTitle>
            <DialogDescription>
              Set up a dedicated fund wallet with a defined savings target ceiling.
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateVault} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="vault-name" className="text-xs font-semibold">
                Vault Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vault-name"
                placeholder="e.g. Emergency Reserve, Tax Provision, IT Hardware"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vault-target" className="text-xs font-semibold">
                  Target Amount ({currency}) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-muted-foreground select-none">
                    {symbol}
                  </span>
                  <Input
                    id="vault-target"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={createForm.targetAmount}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, targetAmount: e.target.value }))
                    }
                    required
                    className="pl-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vault-initial" className="text-xs font-semibold">
                  Initial Cash Allocation
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-muted-foreground select-none">
                    {symbol}
                  </span>
                  <Input
                    id="vault-initial"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={createForm.initialAllocated}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, initialAllocated: e.target.value }))
                    }
                    className="pl-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vault-desc" className="text-xs font-semibold">
                Description & Purpose
              </Label>
              <Input
                id="vault-desc"
                placeholder="What is this fund earmarked for?"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isCreating} className="gap-1.5">
                {isCreating ? (
                  <span>Creating Vault...</span>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create Vault</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD CASH MODAL */}
      <Dialog
        open={Boolean(addCashTarget)}
        onOpenChange={(open) => !open && setAddCashTarget(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Add Cash to Vault</span>
            </DialogTitle>
            <DialogDescription>
              Allocate cash funds towards <span className="font-semibold text-foreground">'{addCashTarget?.name}'</span>.
            </DialogDescription>
          </DialogHeader>

          {addCashError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{addCashError}</span>
            </div>
          )}

          {addCashTarget && (
            <form onSubmit={handleAddCash} className="space-y-4 py-2">
              {/* Vault Progress Context Box */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Saved:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatAmount(addCashTarget.currentAllocated)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Ceiling:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatAmount(addCashTarget.targetAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-1.5 font-medium">
                  <span className="text-muted-foreground">Remaining to Goal:</span>
                  <span className="font-mono text-primary font-semibold">
                    {formatAmount(Math.max(0, addCashTarget.targetAmount - addCashTarget.currentAllocated))}
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <Label htmlFor="cash-amount" className="text-xs font-semibold">
                  Deposit Amount ({currency}) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-muted-foreground select-none">
                    {symbol}
                  </span>
                  <Input
                    id="cash-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    required
                    autoFocus
                    className="pl-8 text-sm font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[500, 1000, 5000].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCashAmount(String(preset))}
                    className="h-7 text-xs font-mono"
                  >
                    +{symbol}{preset.toLocaleString()}
                  </Button>
                ))}
                {addCashTarget.targetAmount > addCashTarget.currentAllocated && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCashAmount(
                        String((addCashTarget.targetAmount - addCashTarget.currentAllocated).toFixed(2))
                      )
                    }
                    className="h-7 text-xs font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  >
                    Fill Remaining ({symbol}{(addCashTarget.targetAmount - addCashTarget.currentAllocated).toLocaleString()})
                  </Button>
                )}
              </div>

              {/* Real-time Target Met preview */}
              {(() => {
                const addVal = parseFloat(cashAmount) || 0;
                if (addVal > 0) {
                  const newTotal = (addCashTarget.currentAllocated || 0) + addVal;
                  const willMeet = newTotal >= addCashTarget.targetAmount;
                  return (
                    <div
                      className={cn(
                        'rounded-md p-2.5 text-xs flex items-center gap-2 border',
                        willMeet
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-muted/40 border-border text-muted-foreground'
                      )}
                    >
                      {willMeet ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 shrink-0" />
                      )}
                      <span>
                        New balance will be{' '}
                        <strong className="font-mono">{formatAmount(newTotal)}</strong>
                        {willMeet && ' — this will automatically complete the vault goal!'}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddCashTarget(null)}
                  disabled={isAddingCash}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isAddingCash}
                  className="gap-1.5"
                >
                  {isAddingCash ? (
                    <span>Allocating...</span>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4" />
                      <span>Deposit Cash</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Delete Vault</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">'{deleteTarget?.name}'</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteVault}
            >
              Delete Vault
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Vault;
