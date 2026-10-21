import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  User,
  FileText,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
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

const TYPE_CONFIG = {
  Sale: {
    label: 'Sale',
    icon: TrendingUp,
    badgeVariant: 'default',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amountClass: 'text-emerald-600 dark:text-emerald-400',
    prefix: '+',
    isInflow: true,
  },
  Receipt: {
    label: 'Receipt',
    icon: ArrowDownRight,
    badgeVariant: 'default',
    color: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20',
    amountClass: 'text-teal-600 dark:text-teal-400',
    prefix: '+',
    isInflow: true,
  },
  Purchase: {
    label: 'Purchase',
    icon: ShoppingBag,
    badgeVariant: 'secondary',
    color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
    amountClass: 'text-sky-600 dark:text-sky-400',
    prefix: '-',
    isInflow: false,
  },
  Payment: {
    label: 'Payment',
    icon: ArrowUpRight,
    badgeVariant: 'secondary',
    color: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
    amountClass: 'text-violet-600 dark:text-violet-400',
    prefix: '-',
    isInflow: false,
  },
  Expense: {
    label: 'Expense',
    icon: CreditCard,
    badgeVariant: 'destructive',
    color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    amountClass: 'text-rose-600 dark:text-rose-400',
    prefix: '-',
    isInflow: false,
  },
};

export const Transactions = () => {
  const { currency, symbol, formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Sale',
    party: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteConfirmTx, setDeleteConfirmTx] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback State
  const [feedback, setFeedback] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.getTransactions({
        type: selectedType,
        search: searchTerm,
      });
      if (res.success) {
        setTransactions(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
      showFeedback('error', err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeople = async () => {
    try {
      const res = await api.getPeople();
      if (res.success) {
        setPeople(res.data || []);
      }
    } catch (err) {
      console.warn('Could not pre-fetch people:', err);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedType]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  // Metrics and counts
  const { counts, totals } = useMemo(() => {
    const c = { All: transactions.length, Sale: 0, Purchase: 0, Payment: 0, Receipt: 0, Expense: 0 };
    let inflow = 0;
    let outflow = 0;

    transactions.forEach((tx) => {
      if (c[tx.type] !== undefined) c[tx.type]++;
      const amt = Number(tx.amount) || 0;
      if (['Sale', 'Receipt'].includes(tx.type)) {
        inflow += amt;
      } else {
        outflow += amt;
      }
    });

    return {
      counts: c,
      totals: {
        totalVolume: inflow + outflow,
        inflow,
        outflow,
        netFlow: inflow - outflow,
      },
    };
  }, [transactions]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingTx(null);
    setFormData({
      type: selectedType !== 'All' ? selectedType : 'Sale',
      party: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (tx) => {
    setEditingTx(tx);
    const dateStr = tx.date
      ? new Date(tx.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const partyId = tx.party ? (typeof tx.party === 'object' ? tx.party._id : tx.party) : '';

    setFormData({
      type: tx.type,
      party: partyId || '',
      amount: tx.amount.toString(),
      date: dateStr,
      notes: tx.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setEditingTx(null);
      setFormError('');
    }
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    setFormError('');

    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid amount greater than 0');
      return;
    }

    if (!formData.date) {
      setFormError('Please select a valid date');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type: formData.type,
        party: formData.party || null,
        amount: amt,
        date: formData.date,
        notes: formData.notes.trim(),
      };

      if (editingTx) {
        const res = await api.updateTransaction(editingTx._id, payload);
        if (res.success) {
          showFeedback('success', `Updated ${formData.type} transaction of ${formatAmount(amt)}`);
          handleCloseModal();
          fetchTransactions();
        }
      } else {
        const res = await api.createTransaction(payload);
        if (res.success) {
          showFeedback('success', `Created ${formData.type} transaction of ${formatAmount(amt)}`);
          handleCloseModal();
          fetchTransactions();
        }
      }
    } catch (err) {
      setFormError(err.data?.message || err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteConfirmTx) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteTransaction(deleteConfirmTx._id);
      if (res.success) {
        showFeedback('success', `Removed ${deleteConfirmTx.type} transaction`);
        setDeleteConfirmTx(null);
        fetchTransactions();
      }
    } catch (err) {
      showFeedback('error', err.message || 'Failed to remove transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2",
            feedback.type === 'success'
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
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

      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Transactions
          </h2>
          <p className="text-sm text-muted-foreground">
            Record sales, purchases, payments, receipts, and operational expenses.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Create Transaction</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Inflows
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
              {formatAmount(totals.inflow)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sales & direct client receipts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Outflows
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono">
              {formatAmount(totals.outflow)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Purchases, expenses & payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Net Cash Flow
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold tracking-tight font-mono",
                totals.netFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatAmount(totals.netFlow, { showSign: true })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Net operating balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Vouchers
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {transactions.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total transaction records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Type Filter Tabs */}
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-fit overflow-x-auto">
          {['All', 'Sale', 'Purchase', 'Payment', 'Receipt', 'Expense'].map((type) => {
            const count = counts[type] || 0;
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "hover:text-foreground"
                )}
                onClick={() => setSelectedType(type)}
              >
                <span>{type === 'All' ? 'All Types' : type}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px]",
                    isActive ? "bg-muted text-foreground" : "bg-muted-foreground/20"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes, amount, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-9 text-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Transactions Table Card */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm">Loading transactions ledger...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <ArrowLeftRight className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {searchTerm || selectedType !== 'All'
                  ? 'No matching transactions found'
                  : 'No transactions recorded yet'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                {searchTerm || selectedType !== 'All'
                  ? `No records found matching "${searchTerm}" in ${selectedType} category.`
                  : 'Start recording sales, bills, payments, and receipts to track organizational flow.'}
              </p>
              {searchTerm || selectedType !== 'All' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('All');
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button size="sm" onClick={handleOpenCreateModal} className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Create First Transaction</span>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="w-[130px]">Type</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead>Notes / Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const typeConf = TYPE_CONFIG[tx.type] || TYPE_CONFIG.Sale;
                  const TypeIcon = typeConf.icon;
                  const formattedDate = tx.date
                    ? new Date(tx.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—';

                  const partyName = tx.party
                    ? typeof tx.party === 'object'
                      ? tx.party.name
                      : tx.party
                    : null;

                  const partyType = tx.party && typeof tx.party === 'object' ? tx.party.type : null;

                  return (
                    <TableRow key={tx._id}>
                      {/* Date */}
                      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <Badge
                          variant={typeConf.badgeVariant}
                          className="gap-1 px-2 py-0.5 text-xs font-medium"
                        >
                          <TypeIcon className="h-3 w-3" />
                          <span>{tx.type}</span>
                        </Badge>
                      </TableCell>

                      {/* Party */}
                      <TableCell>
                        {partyName ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground text-sm">
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
                            Direct / No Party
                          </span>
                        )}
                      </TableCell>

                      {/* Notes */}
                      <TableCell className="max-w-md">
                        <span className="text-xs text-muted-foreground truncate block" title={tx.notes}>
                          {tx.notes || '—'}
                        </span>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right font-mono font-semibold text-sm">
                        <span className={typeConf.amountClass}>
                          {typeConf.prefix}
                          {formatAmount(tx.amount)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEditModal(tx)}
                            title="Edit Transaction"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteConfirmTx(tx)}
                            title="Delete Transaction"
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
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTx ? 'Edit Transaction' : 'Record Transaction'}
            </DialogTitle>
            <DialogDescription>
              Record sales, purchases, disbursements, or receipts in your general ledger.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSaveTransaction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type Selector Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="tx-type">Transaction Type *</Label>
                <select
                  id="tx-type"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Sale" className="bg-popover text-popover-foreground">Sale (Revenue)</option>
                  <option value="Purchase" className="bg-popover text-popover-foreground">Purchase (Goods/Procurement)</option>
                  <option value="Payment" className="bg-popover text-popover-foreground">Payment (Outflow to Vendor/Staff)</option>
                  <option value="Receipt" className="bg-popover text-popover-foreground">Receipt (Inflow from Customer)</option>
                  <option value="Expense" className="bg-popover text-popover-foreground">Expense (Operating Overhead)</option>
                </select>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="tx-amount">Amount ({currency}) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm font-mono font-bold text-muted-foreground select-none">
                    {symbol}
                  </span>
                  <Input
                    id="tx-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleFormChange}
                    className="pl-9 font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date Input */}
              <div className="space-y-2">
                <Label htmlFor="tx-date">Transaction Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tx-date"
                    name="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={handleFormChange}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              {/* Party Selector Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="tx-party">Counterparty (Optional)</Label>
                <select
                  id="tx-party"
                  name="party"
                  value={formData.party}
                  onChange={handleFormChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="" className="bg-popover text-popover-foreground">
                    — None (Direct / Internal) —
                  </option>
                  {people.map((p) => (
                    <option key={p._id} value={p._id} className="bg-popover text-popover-foreground">
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes / Description */}
            <div className="space-y-2">
              <Label htmlFor="tx-notes">Description / Notes</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tx-notes"
                  name="notes"
                  placeholder="e.g. Invoice #2026-09 payment, cloud subscription..."
                  value={formData.notes}
                  onChange={handleFormChange}
                  className="pl-9"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : editingTx
                  ? 'Save Changes'
                  : 'Record Transaction'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmTx}
        onOpenChange={(open) => !open && setDeleteConfirmTx(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this{' '}
              <strong className="text-foreground">
                {deleteConfirmTx?.type}
              </strong>{' '}
              of{' '}
              <strong className="text-foreground font-mono">
                {deleteConfirmTx ? formatAmount(deleteConfirmTx.amount) : ''}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmTx(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTransaction}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
