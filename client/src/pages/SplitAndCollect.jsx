import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Trash2,
  RefreshCw,
  Check,
  X,
  PieChart,
  Eye,
  Layers,
  ArrowRight,
  UserPlus,
  Scale,
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

export function SplitAndCollect() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [collections, setCollections] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Detail View State
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingParticipantId, setUpdatingParticipantId] = useState(null);

  // Create Split Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formTotalAmount, setFormTotalAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formParticipants, setFormParticipants] = useState([
    { person: '', shareAmount: '' },
    { person: '', shareAmount: '' },
  ]);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load initial collections and people list
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [colRes, peopleRes] = await Promise.all([
        api.getSplitCollections(),
        api.getPeople(),
      ]);

      setCollections(colRes.data || []);
      setPeople(peopleRes.data || []);
    } catch (err) {
      console.error('Failed to load Split & Collect data:', err);
      setError(err.message || 'Failed to load split collections');
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

  // Running sum calculation for the Create Split form
  const runningSum = useMemo(() => {
    return formParticipants.reduce((acc, curr) => {
      const val = parseFloat(curr.shareAmount);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }, [formParticipants]);

  const targetTotal = parseFloat(formTotalAmount) || 0;
  const sumDifference = targetTotal - runningSum;
  const isSumBalanced = Math.abs(sumDifference) < 0.009 && targetTotal > 0;

  // Auto-split equally helper
  const handleSplitEqually = () => {
    if (targetTotal <= 0) {
      setFormError('Please enter a total amount greater than 0 first.');
      return;
    }
    const count = formParticipants.length;
    if (count === 0) return;

    const baseShare = Math.floor((targetTotal / count) * 100) / 100;
    const remainder = Math.round((targetTotal - baseShare * count) * 100) / 100;

    const updated = formParticipants.map((p, idx) => ({
      ...p,
      // distribute remainder cents to the first participant
      shareAmount: (idx === 0 ? baseShare + remainder : baseShare).toFixed(2),
    }));

    setFormParticipants(updated);
    setFormError(null);
  };

  // Add participant row
  const handleAddParticipantRow = () => {
    setFormParticipants((prev) => [...prev, { person: '', shareAmount: '' }]);
  };

  // Remove participant row
  const handleRemoveParticipantRow = (index) => {
    if (formParticipants.length <= 1) {
      setFormError('A split collection must have at least one participant.');
      return;
    }
    setFormParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  // Change participant fields
  const handleParticipantChange = (index, field, value) => {
    setFormParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormTitle('');
    setFormTotalAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    // Pre-populate with first two people if available
    const initialParticipants =
      people.length >= 2
        ? [
            { person: people[0]._id, shareAmount: '' },
            { person: people[1]._id, shareAmount: '' },
          ]
        : people.length === 1
        ? [{ person: people[0]._id, shareAmount: '' }]
        : [{ person: '', shareAmount: '' }];

    setFormParticipants(initialParticipants);
    setFormError(null);
    setIsCreateOpen(true);
  };

  // Submit Create Split Collection
  const handleCreateSplit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (targetTotal <= 0) {
      setFormError('Total amount must be greater than 0.');
      return;
    }

    if (!formParticipants || formParticipants.length === 0) {
      setFormError('Please add at least one participant.');
      return;
    }

    for (let i = 0; i < formParticipants.length; i++) {
      const p = formParticipants[i];
      if (!p.person) {
        setFormError(`Participant #${i + 1} must have a person selected.`);
        return;
      }
      const share = parseFloat(p.shareAmount);
      if (isNaN(share) || share <= 0) {
        setFormError(`Participant #${i + 1} must have a share amount greater than 0.`);
        return;
      }
    }

    if (!isSumBalanced) {
      setFormError(
        `The participant shares sum (${formatAmount(runningSum)}) must equal the total amount (${formatAmount(targetTotal)}). Difference: ${formatAmount(Math.abs(sumDifference))}`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: formTitle.trim() || 'Split Collection',
        totalAmount: targetTotal,
        date: formDate,
        participants: formParticipants.map((p) => ({
          person: p.person,
          shareAmount: parseFloat(p.shareAmount),
          status: 'Pending',
        })),
      };

      const res = await api.createSplitCollection(payload);
      setCollections((prev) => [res.data, ...prev]);
      setIsCreateOpen(false);
      showToast(`Split collection "${res.data.title}" created successfully!`);
    } catch (err) {
      console.error('Failed to create split collection:', err);
      setFormError(err.message || 'Failed to create split collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Mark Paid
  const handleMarkPaid = async (collectionId, participantId) => {
    try {
      setUpdatingParticipantId(participantId);
      const res = await api.updateParticipantStatus(collectionId, participantId, 'Paid');

      // Update both collection in list and currently opened detail modal
      setCollections((prev) =>
        prev.map((c) => (c._id === collectionId ? res.data : c))
      );
      if (selectedCollection && selectedCollection._id === collectionId) {
        setSelectedCollection(res.data);
      }

      showToast('Participant share marked as Paid ✓');
    } catch (err) {
      console.error('Failed to update participant status:', err);
      showToast(err.message || 'Failed to update status');
    } finally {
      setUpdatingParticipantId(null);
    }
  };

  // Handle Delete
  const handleDeleteCollection = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.deleteSplitCollection(deleteTarget._id);
      setCollections((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      if (selectedCollection && selectedCollection._id === deleteTarget._id) {
        setIsDetailOpen(false);
        setSelectedCollection(null);
      }
      showToast('Split collection deleted');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete split collection:', err);
      showToast(err.message || 'Failed to delete split collection');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter collections by search query
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase().trim();
    return collections.filter((c) => {
      const titleMatch = c.title && c.title.toLowerCase().includes(q);
      const amountMatch = String(c.totalAmount).includes(q);
      const participantMatch = (c.participants || []).some((p) => {
        const pName = typeof p.person === 'object' && p.person ? p.person.name : '';
        return pName.toLowerCase().includes(q);
      });
      return titleMatch || amountMatch || participantMatch;
    });
  }, [collections, searchQuery]);

  // Overall statistics
  const stats = useMemo(() => {
    let totalExpected = 0;
    let totalCollected = 0;
    let totalPendingCount = 0;
    let totalPaidCount = 0;

    collections.forEach((c) => {
      totalExpected += Number(c.totalAmount || 0);
      (c.participants || []).forEach((p) => {
        if (p.status === 'Paid') {
          totalCollected += Number(p.shareAmount || 0);
          totalPaidCount++;
        } else {
          totalPendingCount++;
        }
      });
    });

    const totalOutstanding = totalExpected - totalCollected;

    return {
      totalExpected,
      totalCollected,
      totalOutstanding,
      totalPaidCount,
      totalPendingCount,
    };
  }, [collections]);

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
              Split & Collect
            </h1>
            <Badge variant="outline" className="px-2 py-0.5 text-xs font-mono">
              Group Shared Bills
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Split group expenses, allocate individual shares to contacts, and track incoming collections.
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

          <Button
            size="sm"
            onClick={handleOpenCreateModal}
            className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>Create Split</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Split Value
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-foreground">
                  {formatAmount(stats.totalExpected)}
                </span>
                <span className="text-xs text-muted-foreground">
                  across {collections.length} bills
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PieChart className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Collected Shares
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatAmount(stats.totalCollected)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({stats.totalPaidCount} shares paid)
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
                Pending Collection
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  {formatAmount(stats.totalOutstanding)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({stats.totalPendingCount} pending)
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, participant, amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs bg-card"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
          Showing {filteredCollections.length} split collections
        </span>
      </div>

      {/* Main Collections List Table */}
      <Card className="border-border">
        <CardHeader className="p-4 border-b border-border bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Split Expense Collections
              </CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">
              Click "View Details" to review participants and mark collections
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
              <p className="text-sm">Loading split collections...</p>
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <PieChart className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No split collections found
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Split joint bills, dinners, office supplies, or travel expenses among multiple participants.
              </p>
              <Button
                size="sm"
                onClick={handleOpenCreateModal}
                className="mt-4 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Split</span>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead>Collection / Title</TableHead>
                    <TableHead className="text-right w-[140px]">Total Amount</TableHead>
                    {/* Prompt requirement: list of collections with total amount, date, and paid/pending count */}
                    <TableHead className="w-[200px]">Paid / Pending Count</TableHead>
                    <TableHead className="w-[140px]">Status</TableHead>
                    <TableHead className="text-right w-[130px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCollections.map((col) => {
                    const participants = col.participants || [];
                    const paidCount = participants.filter((p) => p.status === 'Paid').length;
                    const pendingCount = participants.length - paidCount;
                    const isAllPaid = participants.length > 0 && pendingCount === 0;

                    const formattedDate = col.date
                      ? new Date(col.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—';

                    return (
                      <TableRow key={col._id} className="hover:bg-muted/40 transition-colors">
                        {/* Date */}
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formattedDate}</span>
                          </div>
                        </TableCell>

                        {/* Title & Participant summary */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground">
                              {col.title || 'Split Collection'}
                            </span>
                            <span className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-sm">
                              {participants
                                .map((p) =>
                                  typeof p.person === 'object' && p.person
                                    ? p.person.name
                                    : 'Contact'
                                )
                                .join(', ')}
                            </span>
                          </div>
                        </TableCell>

                        {/* Total Amount */}
                        <TableCell className="text-right font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                          {formatAmount(col.totalAmount)}
                        </TableCell>

                        {/* Paid / Pending Count */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px] font-mono px-2 py-0.5",
                                isAllPaid
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                  : "border-border bg-muted/40 text-foreground"
                              )}
                            >
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">{paidCount} Paid</span>
                              <span className="mx-1 text-muted-foreground">•</span>
                              <span
                                className={cn(
                                  pendingCount > 0 ? "text-amber-700 dark:text-amber-400 font-semibold" : "text-muted-foreground"
                                )}
                              >
                                {pendingCount} Pending
                              </span>
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell>
                          {isAllPaid ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Settled</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] gap-1"
                            >
                              <Clock className="h-3 w-3" />
                              <span>In Progress</span>
                            </Badge>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs gap-1"
                              onClick={() => {
                                setSelectedCollection(col);
                                setIsDetailOpen(true);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Details</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget(col)}
                              title="Delete Collection"
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

      {/* DETAIL MODAL: Each collection's detail view listing participants with 'Mark Paid' button */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedCollection && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-4">
                  <div>
                    <DialogTitle className="text-lg">
                      {selectedCollection.title || 'Split Collection Details'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Recorded on{' '}
                      {new Date(selectedCollection.date).toLocaleDateString('en-US', {
                        dateStyle: 'full',
                      })}
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase font-medium text-muted-foreground block">
                      Total Split
                    </span>
                    <span className="text-xl font-bold font-mono text-foreground">
                      {formatAmount(selectedCollection.totalAmount)}
                    </span>
                  </div>
                </div>
              </DialogHeader>

              {/* Progress Summary in Detail Modal */}
              {(() => {
                const parts = selectedCollection.participants || [];
                const paidSum = parts
                  .filter((p) => p.status === 'Paid')
                  .reduce((sum, p) => sum + Number(p.shareAmount || 0), 0);
                const percent =
                  selectedCollection.totalAmount > 0
                    ? Math.min(100, Math.round((paidSum / selectedCollection.totalAmount) * 100))
                    : 0;

                return (
                  <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Collection Status</span>
                      <span className="font-mono font-semibold text-foreground">
                        {formatAmount(paidSum)} of {formatAmount(selectedCollection.totalAmount)} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Participants List */}
              <div className="space-y-2 py-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Participants & Allocations
                </Label>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Contact / Participant</TableHead>
                        <TableHead className="text-right w-[120px]">Share Amount</TableHead>
                        <TableHead className="text-center w-[110px]">Status</TableHead>
                        {/* Prompt requirement: 'Mark Paid' button next to pending ones */}
                        <TableHead className="text-right w-[120px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedCollection.participants || []).map((participant) => {
                        const person = participant.person;
                        const personName =
                          typeof person === 'object' && person ? person.name : 'Unknown Contact';
                        const personMobile =
                          typeof person === 'object' && person ? person.mobile : '';
                        const personType =
                          typeof person === 'object' && person ? person.type : '';

                        const isPending = participant.status !== 'Paid';
                        const isThisUpdating = updatingParticipantId === participant._id;

                        return (
                          <TableRow key={participant._id} className="border-border hover:bg-muted/30">
                            {/* Person info */}
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-foreground">
                                    {personName}
                                  </span>
                                  {personType && (
                                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                      {personType}
                                    </span>
                                  )}
                                </div>
                                {personMobile && (
                                  <span className="text-[11px] text-muted-foreground font-mono">
                                    {personMobile}
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* Share Amount */}
                            <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                              {formatAmount(participant.shareAmount)}
                            </TableCell>

                            {/* Status */}
                            <TableCell className="text-center">
                              {isPending ? (
                                <Badge
                                  variant="outline"
                                  className="border-amber-500/20 bg-amber-500/10 text-amber-400 text-[10px]"
                                >
                                  Pending
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] gap-1"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Paid</span>
                                </Badge>
                              )}
                            </TableCell>

                            {/* Action: 'Mark Paid' button next to pending ones */}
                            <TableCell className="text-right">
                              {isPending ? (
                                <Button
                                  size="sm"
                                  disabled={isThisUpdating}
                                  onClick={() =>
                                    handleMarkPaid(selectedCollection._id, participant._id)
                                  }
                                  className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                                >
                                  {isThisUpdating ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                  <span>Mark Paid</span>
                                </Button>
                              ) : (
                                <span className="text-xs font-mono text-emerald-400 font-medium">
                                  Settled ✓
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CREATE SPLIT MODAL: Form with total amount, add participants from People, enter shares with running sum */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Split Collection</DialogTitle>
            <DialogDescription>
              Divide a bill or expense across multiple people and track their repayment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSplit} className="space-y-4 py-2">
            {formError && (
              <div className="flex items-center gap-2 rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Title / Description */}
            <div className="space-y-1.5">
              <Label htmlFor="splitTitle" className="text-xs font-medium">
                Collection Title / Memo
              </Label>
              <Input
                id="splitTitle"
                placeholder="e.g. Quarterly Team Dinner, Shared Office WiFi, Client Dinner"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Total Amount & Date row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="splitAmount" className="text-xs font-medium">
                  Total Amount ({currency}) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono font-bold text-muted-foreground select-none">
                    {symbol}
                  </span>
                  <Input
                    id="splitAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formTotalAmount}
                    onChange={(e) => setFormTotalAmount(e.target.value)}
                    required
                    className="h-9 font-mono text-xs pl-8"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="splitDate" className="text-xs font-medium">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="splitDate"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="h-9 font-mono text-xs"
                />
              </div>
            </div>

            {/* Participants allocation section */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">
                    Participant Allocations <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Select people and enter their respective split share amounts.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSplitEqually}
                  className="h-7 text-xs gap-1"
                  title="Divide total amount equally among participants"
                >
                  <Scale className="h-3 w-3" />
                  <span>Split Equally</span>
                </Button>
              </div>

              {/* Participant rows */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {formParticipants.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
                  >
                    <span className="text-[10px] font-mono text-muted-foreground w-4 text-center">
                      #{idx + 1}
                    </span>

                    {/* People dropdown */}
                    <div className="flex-1">
                      <select
                        value={p.person}
                        onChange={(e) =>
                          handleParticipantChange(idx, 'person', e.target.value)
                        }
                        required
                        className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="">-- Choose Person from Directory --</option>
                        {people.map((person) => (
                          <option key={person._id} value={person._id}>
                            {person.name} ({person.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Share Amount input */}
                    <div className="w-28 sm:w-32">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={`Share ${symbol}`}
                        value={p.shareAmount}
                        onChange={(e) =>
                          handleParticipantChange(idx, 'shareAmount', e.target.value)
                        }
                        required
                        className="h-8 font-mono text-xs"
                      />
                    </div>

                    {/* Remove row */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleRemoveParticipantRow(idx)}
                      disabled={formParticipants.length <= 1}
                      title="Remove participant"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Participant Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddParticipantRow}
                className="w-full h-8 text-xs gap-1 border-dashed mt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Another Participant</span>
              </Button>
            </div>

            {/* Prompt requirement: Running sum indicator to see if shares add up to total */}
            <div
              className={cn(
                "rounded-lg border p-3 transition-colors",
                isSumBalanced
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400"
                  : targetTotal > 0 && Math.abs(sumDifference) > 0
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-400"
                  : "border-border bg-muted/40 text-muted-foreground"
              )}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  {isSumBalanced ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  )}
                  <span className="font-semibold">
                    Running Sum: {formatAmount(runningSum)}
                  </span>
                </div>
                <div>
                  <span>Target Total: {formatAmount(targetTotal)}</span>
                </div>
              </div>

              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span>
                  {isSumBalanced
                    ? '✓ Shares add up perfectly to the total amount.'
                    : targetTotal > 0
                    ? sumDifference > 0
                      ? `⚠️ Unallocated balance: ${formatAmount(sumDifference)} remaining`
                      : `⚠️ Shares exceed total by: ${formatAmount(Math.abs(sumDifference))}`
                    : 'Enter total amount to begin balancing.'}
                </span>
                {isSumBalanced && (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                    Balanced 100%
                  </Badge>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !isSumBalanced}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Plus className="h-3.5 w-3.5 mr-1" />
                )}
                Save Split Collection
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Split Collection?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">
                "{deleteTarget?.title || 'this split collection'}"
              </span>
              ? This action cannot be undone.
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
              onClick={handleDeleteCollection}
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

export default SplitAndCollect;
