import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarClock,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Trash2,
  Pencil,
  RefreshCw,
  Check,
  X,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  Tag,
  User,
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
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const ACTIVITY_TYPES = ['Payment', 'Collection', 'Expense', 'Other'];

const ACTIVITY_TYPE_CONFIG = {
  Payment: {
    label: 'Payment',
    icon: ArrowUpRight,
    badge: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400',
    amountClass: 'text-violet-600 dark:text-violet-400',
    prefix: '-',
  },
  Collection: {
    label: 'Collection',
    icon: ArrowDownRight,
    badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    amountClass: 'text-emerald-600 dark:text-emerald-400',
    prefix: '+',
  },
  Expense: {
    label: 'Expense',
    icon: CreditCard,
    badge: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    amountClass: 'text-rose-600 dark:text-rose-400',
    prefix: '-',
  },
  Other: {
    label: 'Other',
    icon: Tag,
    badge: 'border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-400',
    amountClass: 'text-foreground',
    prefix: '',
  },
};

export function Planner() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [plans, setPlans] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Upcoming' | 'Completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Form modal state (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formActivityType, setFormActivityType] = useState('Payment');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formParty, setFormParty] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState('Upcoming');
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action status state
  const [completingPlanId, setCompletingPlanId] = useState(null);
  const [recentlyCompletedId, setRecentlyCompletedId] = useState(null);

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load plans & people
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [plansRes, peopleRes] = await Promise.all([
        api.getPlans(),
        api.getPeople(),
      ]);

      setPlans(plansRes.data || []);
      setPeople(peopleRes.data || []);
    } catch (err) {
      console.error('Failed to load planner data:', err);
      setError(err.message || 'Failed to load planner records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4000);
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormActivityType('Payment');
    setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormParty('');
    setFormNotes('');
    setFormStatus('Upcoming');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormActivityType(plan.activityType || 'Payment');
    setFormAmount(String(plan.amount || ''));
    setFormDate(
      plan.scheduledDate
        ? new Date(plan.scheduledDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
    const partyId =
      typeof plan.party === 'object' && plan.party ? plan.party._id : plan.party || '';
    setFormParty(partyId);
    setFormNotes(plan.notes || '');
    setFormStatus(plan.status || 'Upcoming');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit Create or Edit
  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    setFormError(null);

    const numericAmount = parseFloat(formAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Please enter a valid amount greater than 0');
      return;
    }

    if (!formDate) {
      setFormError('Please select a scheduled date');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        activityType: formActivityType,
        amount: numericAmount,
        scheduledDate: formDate,
        party: formParty || null,
        notes: formNotes.trim(),
        status: formStatus,
      };

      if (editingPlan) {
        const res = await api.updatePlan(editingPlan._id, payload);
        setPlans((prev) =>
          prev.map((p) => (p._id === editingPlan._id ? res.data : p))
        );
        showToast(`Plan updated successfully`);
      } else {
        const res = await api.createPlan(payload);
        setPlans((prev) => [res.data, ...prev]);
        showToast(`${formActivityType} plan scheduled successfully!`);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save plan:', err);
      setFormError(err.message || 'Failed to save plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prompt requirement: Each plan should have a 'Mark Completed' button
  const handleMarkCompleted = async (planId, currentStatus) => {
    try {
      setCompletingPlanId(planId);
      const nextStatus = currentStatus === 'Completed' ? 'Upcoming' : 'Completed';
      const res = await api.markPlanCompleted(planId, nextStatus);

      setPlans((prev) =>
        prev.map((p) => (p._id === planId ? res.data : p))
      );

      if (nextStatus === 'Completed') {
        setRecentlyCompletedId(planId);
        setTimeout(() => {
          setRecentlyCompletedId((prev) => (prev === planId ? null : prev));
        }, 2500);
        showToast('Plan marked as Completed ✓');
      } else {
        showToast('Plan reopened as Upcoming');
      }
    } catch (err) {
      console.error('Failed to update plan status:', err);
      showToast(err.message || 'Failed to mark plan as completed');
    } finally {
      setCompletingPlanId(null);
    }
  };

  // Delete Plan
  const handleDeletePlan = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.deletePlan(deleteTarget._id);
      setPlans((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      showToast('Plan deleted');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete plan:', err);
      showToast(err.message || 'Failed to delete plan');
    } finally {
      setIsDeleting(false);
    }
  };

  // Sorting & Filtering:
  // Prompt requirement: "showing a list of plans sorted by scheduled date, with upcoming ones highlighted first."
  const sortedAndFilteredPlans = useMemo(() => {
    let list = [...plans];

    // Filter by status tab
    if (statusFilter !== 'All') {
      list = list.filter((p) => p.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const notesMatch = p.notes && p.notes.toLowerCase().includes(q);
        const typeMatch = p.activityType && p.activityType.toLowerCase().includes(q);
        const amountMatch = String(p.amount).includes(q);
        const partyName =
          typeof p.party === 'object' && p.party ? p.party.name : '';
        const partyMatch = partyName.toLowerCase().includes(q);
        return notesMatch || typeMatch || amountMatch || partyMatch;
      });
    }

    // PRIMARY REQUIREMENT: Upcoming ones highlighted first, sorted by scheduled date
    list.sort((a, b) => {
      const aUpcoming = a.status === 'Upcoming';
      const bUpcoming = b.status === 'Upcoming';

      // Upcoming first
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;

      // For upcoming: soonest scheduled date first
      if (aUpcoming && bUpcoming) {
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
      }

      // For completed: most recently completed / scheduled first
      return new Date(b.scheduledDate) - new Date(a.scheduledDate);
    });

    return list;
  }, [plans, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    let upcomingCount = 0;
    let upcomingAmount = 0;
    let completedCount = 0;
    let completedAmount = 0;

    plans.forEach((p) => {
      const amt = Number(p.amount || 0);
      if (p.status === 'Upcoming') {
        upcomingCount++;
        upcomingAmount += amt;
      } else {
        completedCount++;
        completedAmount += amt;
      }
    });

    return {
      upcomingCount,
      upcomingAmount,
      completedCount,
      completedAmount,
      totalCount: plans.length,
      totalAmount: upcomingAmount + completedAmount,
    };
  }, [plans]);

  // Date badge helper (Due soon, Overdue, Future)
  const getDateLabel = (dateStr, status) => {
    if (!dateStr) return null;
    const planDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(planDate);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (status === 'Completed') {
      return null;
    }

    if (diffDays < 0) {
      return (
        <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
          Overdue by {Math.abs(diffDays)}d
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded animate-pulse">
          Scheduled Today
        </span>
      );
    }
    if (diffDays <= 3) {
      return (
        <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded">
          In {diffDays} days
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Planner
            </h1>
            <Badge variant="outline" className="px-2 py-0.5 text-xs font-mono">
              Cash Flow Schedules
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Schedule future payments, collections, and expenses. Track upcoming cash commitments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-9 gap-1.5"
            title="Refresh List"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Prompt requirement: Add a 'Create Plan' form button */}
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>Create Plan</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Upcoming Commitments
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  {formatAmount(stats.upcomingAmount)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({stats.upcomingCount} pending)
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Completed Plans
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatAmount(stats.completedAmount)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({stats.completedCount} fulfilled)
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Budgeted Volume
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-foreground">
                  {formatAmount(stats.totalAmount)}
                </span>
                <span className="text-xs text-muted-foreground">
                  across {stats.totalCount} events
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarClock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Status Switcher Tabs */}
        <div className="inline-flex h-9 items-center rounded-lg border border-border bg-muted/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('All')}
            className={cn(
              "rounded-md px-3 py-1 font-medium transition-colors",
              statusFilter === 'All'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All Plans ({plans.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Upcoming')}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors",
              statusFilter === 'Upcoming'
                ? "bg-background text-amber-400 shadow-sm font-semibold"
                : "text-muted-foreground hover:text-amber-400"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Upcoming ({stats.upcomingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Completed')}
            className={cn(
              "rounded-md px-3 py-1 font-medium transition-colors",
              statusFilter === 'Completed'
                ? "bg-background text-emerald-400 shadow-sm font-semibold"
                : "text-muted-foreground hover:text-emerald-400"
            )}
          >
            Completed ({stats.completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes, party, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs bg-card"
          />
        </div>
      </div>

      {/* Plans List Table */}
      <Card className="border-border">
        <CardHeader className="p-4 border-b border-border bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Scheduled Financial Events
              </CardTitle>
              <Badge variant="secondary" className="text-[11px] font-mono">
                {sortedAndFilteredPlans.length} plans
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              ⚡ Sorted by scheduled date with upcoming plans prioritized
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
              <p className="text-sm">Loading planner schedule...</p>
            </div>
          ) : sortedAndFilteredPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <CalendarClock className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No planned financial activities found
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Schedule your next invoice collections, rent payments, tax provisions, or vendor settlements.
              </p>
              <Button size="sm" onClick={handleOpenCreate} className="mt-4 gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Create First Plan</span>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-[150px]">Scheduled Date</TableHead>
                    <TableHead className="w-[120px]">Activity</TableHead>
                    <TableHead>Party / Notes</TableHead>
                    <TableHead className="text-right w-[130px]">Amount</TableHead>
                    <TableHead className="w-[130px]">Status</TableHead>
                    {/* Prompt requirement: Each plan should have a 'Mark Completed' button */}
                    <TableHead className="text-right w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAndFilteredPlans.map((plan) => {
                    const isUpcoming = plan.status === 'Upcoming';
                    const config = ACTIVITY_TYPE_CONFIG[plan.activityType] || ACTIVITY_TYPE_CONFIG.Other;
                    const TypeIcon = config.icon;
                    const isCompleting = completingPlanId === plan._id;
                    const isRecentlyCompleted = recentlyCompletedId === plan._id;

                    const formattedDate = plan.scheduledDate
                      ? new Date(plan.scheduledDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—';

                    const dateTag = getDateLabel(plan.scheduledDate, plan.status);

                    const partyName =
                      typeof plan.party === 'object' && plan.party ? plan.party.name : null;
                    const partyType =
                      typeof plan.party === 'object' && plan.party ? plan.party.type : null;

                    return (
                      <TableRow
                        key={plan._id}
                        className={cn(
                          "transition-colors",
                          isUpcoming
                            ? "bg-amber-500/[0.02] hover:bg-amber-500/[0.06]"
                            : "hover:bg-muted/40",
                          isRecentlyCompleted && "bg-emerald-500/10"
                        )}
                      >
                        {/* Scheduled Date */}
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-foreground">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">{formattedDate}</span>
                            </div>
                            {dateTag}
                          </div>
                        </TableCell>

                        {/* Activity Type */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("gap-1 px-2 py-0.5 text-xs font-medium", config.badge)}
                          >
                            <TypeIcon className="h-3 w-3" />
                            <span>{plan.activityType}</span>
                          </Badge>
                        </TableCell>

                        {/* Party & Notes */}
                        <TableCell className="max-w-md">
                          <div className="flex flex-col">
                            {partyName ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-foreground">
                                  {partyName}
                                </span>
                                {partyType && (
                                  <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                    {partyType}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                General Activity
                              </span>
                            )}
                            {plan.notes ? (
                              <span
                                className="text-[11px] text-muted-foreground truncate block mt-0.5"
                                title={plan.notes}
                              >
                                {plan.notes}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-right font-mono text-xs font-semibold whitespace-nowrap">
                          <span className={config.amountClass}>
                            {config.prefix}
                            {formatAmount(plan.amount)}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {isUpcoming ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] gap-1 font-medium"
                            >
                              <Clock className="h-3 w-3" />
                              <span>Upcoming</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] gap-1 font-medium"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Completed</span>
                            </Badge>
                          )}
                        </TableCell>

                        {/* Actions: Each plan should have a 'Mark Completed' button */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isUpcoming ? (
                              <Button
                                size="sm"
                                disabled={isCompleting}
                                onClick={() => handleMarkCompleted(plan._id, plan.status)}
                                className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                                title="Mark as Completed"
                              >
                                {isCompleting ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                                <span>Mark Completed</span>
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isCompleting}
                                onClick={() => handleMarkCompleted(plan._id, plan.status)}
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-amber-400"
                                title="Reopen as Upcoming"
                              >
                                <span>Reopen</span>
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => handleOpenEdit(plan)}
                              title="Edit Plan"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget(plan)}
                              title="Delete Plan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT PLAN DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Planned Activity' : 'Create Financial Plan'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? 'Update scheduled financial commitment details.'
                : 'Schedule a future payment, collection, or expense.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPlan} className="space-y-4 py-2">
            {formError && (
              <div className="flex items-center gap-2 rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Activity Type Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="planType" className="text-xs font-medium">
                Activity Type <span className="text-destructive">*</span>
              </Label>
              <select
                id="planType"
                value={formActivityType}
                onChange={(e) => setFormActivityType(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="Payment">Payment (Outgoing to vendor / creditor)</option>
                <option value="Collection">Collection (Incoming from customer / debtor)</option>
                <option value="Expense">Expense (Operational bill, service renewal)</option>
                <option value="Other">Other (General capital movement)</option>
              </select>
            </div>

            {/* Amount & Scheduled Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="planAmount" className="text-xs font-medium">
                  Amount ({currency}) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono font-bold text-muted-foreground select-none">
                    {symbol}
                  </span>
                  <Input
                    id="planAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    className="h-9 font-mono text-xs pl-8"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="planDate" className="text-xs font-medium">
                  Scheduled Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="planDate"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="h-9 font-mono text-xs"
                />
              </div>
            </div>

            {/* Optional Party Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="planParty" className="text-xs font-medium">
                Associated Contact / Party <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <select
                id="planParty"
                value={formParty}
                onChange={(e) => setFormParty(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">-- No Party / Direct Internal --</option>
                {people.map((person) => (
                  <option key={person._id} value={person._id}>
                    {person.name} ({person.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Notes / Description */}
            <div className="space-y-1.5">
              <Label htmlFor="planNotes" className="text-xs font-medium">
                Notes & Reminders
              </Label>
              <Input
                id="planNotes"
                placeholder="e.g. Q4 Milestone collection, Annual domain renewal, Retainer fee"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Status if editing */}
            {editingPlan && (
              <div className="space-y-1.5">
                <Label htmlFor="planStatus" className="text-xs font-medium">
                  Status
                </Label>
                <select
                  id="planStatus"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="Upcoming">Upcoming (Active / Pending)</option>
                  <option value="Completed">Completed (Fulfilled)</option>
                </select>
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Plus className="h-3.5 w-3.5 mr-1" />
                )}
                {editingPlan ? 'Save Changes' : 'Schedule Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM MODAL */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Plan?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this planned {deleteTarget?.activityType?.toLowerCase() || 'item'}{' '}
              {deleteTarget?.notes ? `("${deleteTarget.notes}")` : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeletePlan}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Planner;
