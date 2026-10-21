import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  User,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  X,
  AlertCircle,
  CheckCircle2,
  Building2,
  Briefcase,
  ShoppingBag,
  Truck,
  UserCheck,
  RefreshCw,
  Plus,
  Tag,
} from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
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

// Configuration for the 5 supported roles
const ROLE_CONFIG = {
  Customer: {
    label: 'Customer',
    badgeVariant: 'default',
    icon: ShoppingBag,
    color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  Supplier: {
    label: 'Supplier',
    badgeVariant: 'secondary',
    icon: Building2,
    color: 'text-sky-700 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
  },
  Staff: {
    label: 'Staff',
    badgeVariant: 'outline',
    icon: Briefcase,
    color: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  Vendor: {
    label: 'Vendor',
    badgeVariant: 'secondary',
    icon: Truck,
    color: 'text-purple-700 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  Consultant: {
    label: 'Consultant',
    badgeVariant: 'outline',
    icon: UserCheck,
    color: 'text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
};

export const DEFAULT_ROLES = ['Customer', 'Supplier', 'Staff', 'Vendor', 'Consultant'];

// Helper to get role presentation configuration (icon, badge variant, color)
const getRoleConfig = (roleKey) => {
  if (roleKey && ROLE_CONFIG[roleKey]) return ROLE_CONFIG[roleKey];
  return {
    label: roleKey || 'Other',
    badgeVariant: 'outline',
    icon: Briefcase,
    color: 'text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  };
};

const ADD_ROLE_VALUE = '__ADD_NEW_ROLE__';

const GROUPS = [
  'No Group',
  'Family',
  'Friends',
  'Clients',
  'Vendors',
  'Staff',
  'Consultants',
];

const GROUP_STYLES = {
  'Clients': 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  'Vendors': 'border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400',
  'Staff': 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  'Consultants': 'border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  'Family': 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400',
  'Friends': 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  'No Group': 'border-border bg-muted/40 text-muted-foreground',
};

// Return phone exactly as stored: plain digits without US-style brackets or dashes
const formatDisplayPhone = (raw) => {
  if (!raw) return '';
  return raw.toString();
};

export const People = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedGroup, setSelectedGroup] = useState('All');

  // Roles state (loaded from GET /api/roles)
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [isAddingCustomRole, setIsAddingCustomRole] = useState(false);
  const [newRoleInput, setNewRoleInput] = useState('');
  const [newRoleError, setNewRoleError] = useState('');
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Customer',
    companyName: '',
    phone: '',
    email: '',
    group: 'No Group',
    address: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmPerson, setDeleteConfirmPerson] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / Feedback State
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      const res = await api.getRoles();
      if (res && res.success && Array.isArray(res.data)) {
        setRoles(res.data);
      } else if (Array.isArray(res)) {
        setRoles(res);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Fetch people from API
  const fetchPeople = async () => {
    try {
      setLoading(true);
      const res = await api.getPeople({
        role: selectedRole,
        group: selectedGroup,
        search: searchTerm,
      });
      if (res.success) {
        setPeople(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load people:', err);
      showFeedback('error', err.message || 'Failed to load people');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, [selectedRole, selectedGroup]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPeople();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Counts for role tabs (dynamically calculated across all loaded roles)
  const roleCounts = useMemo(() => {
    const c = { All: people.length };
    roles.forEach((r) => {
      c[r] = 0;
    });
    people.forEach((p) => {
      const r = p.role || p.type;
      if (r) {
        c[r] = (c[r] || 0) + 1;
      }
    });
    return c;
  }, [people, roles]);

  // Split roles for dropdown: default roles first, then custom roles
  const defaultRolesList = useMemo(() => {
    return DEFAULT_ROLES;
  }, []);

  const customRolesList = useMemo(() => {
    return roles.filter((r) => !DEFAULT_ROLES.includes(r));
  }, [roles]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingPerson(null);
    setFormData({
      name: '',
      role: selectedRole !== 'All' ? selectedRole : 'Customer',
      companyName: '',
      phone: '',
      email: '',
      group: selectedGroup !== 'All' ? selectedGroup : 'No Group',
      address: '',
    });
    setIsAddingCustomRole(false);
    setNewRoleInput('');
    setNewRoleError('');
    setFieldErrors({});
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (person) => {
    setEditingPerson(person);
    const personRole = person.role || person.type || 'Customer';
    setFormData({
      name: person.name || '',
      role: personRole,
      companyName: person.companyName || '',
      phone: person.phone || person.mobile || '',
      email: person.email || '',
      group: person.group || 'No Group',
      address: person.address || '',
    });
    // Ensure person's role is in roles list if not already present
    if (personRole && !roles.includes(personRole)) {
      setRoles((prev) => (prev.includes(personRole) ? prev : [...prev, personRole]));
    }
    setIsAddingCustomRole(false);
    setNewRoleInput('');
    setNewRoleError('');
    setFieldErrors({});
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setEditingPerson(null);
      setIsAddingCustomRole(false);
      setNewRoleInput('');
      setNewRoleError('');
      setFieldErrors({});
      setFormError('');
    }
  };

  const handleRoleSelectChange = (e) => {
    const val = e.target.value;
    if (val === ADD_ROLE_VALUE) {
      setIsAddingCustomRole(true);
      setNewRoleInput('');
      setNewRoleError('');
    } else {
      setFormData((prev) => ({ ...prev, role: val }));
      if (fieldErrors.role) {
        setFieldErrors((prev) => ({ ...prev, role: null }));
      }
    }
  };

  const handleSaveNewRole = async () => {
    const trimmed = newRoleInput.trim();
    if (!trimmed) {
      setNewRoleError('Please enter a role name');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 30) {
      setNewRoleError('Role name must be between 2 and 30 characters');
      return;
    }

    setIsSavingRole(true);
    setNewRoleError('');
    try {
      const res = await api.createRole({ name: trimmed });
      const createdName = (res && res.data && res.data.name) || (res && res.name) || trimmed;

      setRoles((prev) => {
        if (prev.includes(createdName)) return prev;
        return [...prev, createdName];
      });

      setFormData((prev) => ({ ...prev, role: createdName }));
      if (fieldErrors.role) {
        setFieldErrors((prev) => ({ ...prev, role: null }));
      }

      setIsAddingCustomRole(false);
      setNewRoleInput('');
      setNewRoleError('');
    } catch (err) {
      console.error('Failed to create custom role:', err);
      setNewRoleError(err.message || 'This role already exists.');
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleCancelNewRole = () => {
    setIsAddingCustomRole(false);
    setNewRoleInput('');
    setNewRoleError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (formError) {
      setFormError('');
    }
  };

  // Handle phone input with 10-digit restriction
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    // Allow digits only or preserve user formatting, but strip non-digits for validation
    const digitsOnly = input.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      phone: digitsOnly,
    }));

    if (fieldErrors.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: null }));
    }
    if (formError) {
      setFormError('');
    }
  };

  // Form submit handler with validations
  const handleSavePerson = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});

    const errors = {};

    // 1. Full Name required
    if (!formData.name.trim()) {
      errors.name = 'Full Name is required';
    }

    // 2. Role required
    if (!formData.role || !formData.role.trim()) {
      errors.role = 'Role is required';
    }

    // 3. Phone required and validated to 10 digits
    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!digitsOnly || digitsOnly.length !== 10) {
      errors.phone = 'Phone number is required and must be exactly 10 digits';
    }

    // 4. Email optional, but validated email format if provided
    const cleanEmail = formData.email.trim().toLowerCase();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Please provide a valid email format (e.g. name@company.com)';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError(Object.values(errors)[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        role: formData.role.trim(),
        type: formData.role.trim(),
        companyName: formData.companyName.trim(),
        phone: digitsOnly,
        mobile: digitsOnly,
        email: cleanEmail,
        group: formData.group || 'No Group',
        address: formData.address.trim(),
      };

      if (editingPerson) {
        // Edit existing
        const res = await api.updatePerson(editingPerson._id, payload);
        if (res.success) {
          showFeedback('success', `Updated ${formData.name}`);
          handleCloseModal();
          fetchPeople();
        }
      } else {
        // Add new
        const res = await api.createPerson(payload);
        if (res.success) {
          showFeedback('success', `Added ${formData.name}`);
          handleCloseModal();
          fetchPeople();
        }
      }
    } catch (err) {
      setFormError(err.data?.message || err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete person
  const handleDeletePerson = async () => {
    if (!deleteConfirmPerson) return;
    setIsDeleting(true);
    try {
      const res = await api.deletePerson(deleteConfirmPerson._id);
      if (res.success) {
        showFeedback('success', `Removed ${deleteConfirmPerson.name}`);
        setDeleteConfirmPerson(null);
        fetchPeople();
      }
    } catch (err) {
      showFeedback('error', err.message || 'Failed to remove person');
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-xl animate-in fade-in slide-in-from-bottom-2",
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
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            People Directory
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your counterparty network: customers, suppliers, staff, vendors, and consultants.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="gap-2 self-start sm:self-auto shadow-sm">
          <UserPlus className="h-4 w-4" />
          <span>Add Person</span>
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Role Filter Tabs */}
        <div className="inline-flex h-9 items-center justify-start overflow-x-auto rounded-lg bg-muted p-1 text-muted-foreground max-w-full">
          {['All', ...roles].map((role) => {
            const count = roleCounts[role] || 0;
            const isActive = selectedRole === role;
            return (
              <button
                key={role}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all",
                  isActive
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "hover:text-foreground"
                )}
                onClick={() => setSelectedRole(role)}
              >
                <span>{role === 'All' ? 'All Roles' : role}</span>
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

        {/* Group Filter & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Group Dropdown Filter */}
          <div className="relative min-w-[150px]">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="All">All Groups</option>
              {GROUPS.map((grp) => (
                <option key={grp} value={grp}>
                  {grp}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, company, phone, email..."
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
      </div>

      {/* Main Card with Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm">Loading people directory...</p>
            </div>
          ) : people.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {searchTerm || selectedRole !== 'All' || selectedGroup !== 'All'
                  ? 'No matching people found'
                  : 'No contacts in directory'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                {searchTerm || selectedRole !== 'All' || selectedGroup !== 'All'
                  ? `No records found matching your active filters. Try clearing filters.`
                  : 'Add your customers, suppliers, staff, vendors, and consultants to begin tracking transactions.'}
              </p>
              {searchTerm || selectedRole !== 'All' || selectedGroup !== 'All' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('All');
                    setSelectedGroup('All');
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button size="sm" onClick={handleOpenCreateModal} className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add First Person</span>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Person / Entity</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Phone / Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => {
                  const roleKey = person.role || person.type || 'Customer';
                  const roleConf = getRoleConfig(roleKey);
                  const RoleIcon = roleConf.icon || Briefcase;
                  const displayPhone = person.phone || person.mobile || '';
                  const groupKey = person.group || 'No Group';
                  const groupClass = GROUP_STYLES[groupKey] || GROUP_STYLES['No Group'];

                  return (
                    <TableRow key={person._id}>
                      {/* Name, Company & Initials Avatar */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback
                              className={cn(
                                "text-xs font-semibold border",
                                roleConf.color
                              )}
                            >
                              {getInitials(person.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate">
                              {person.name}
                            </span>
                            {person.companyName ? (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                                <Building2 className="h-3 w-3 shrink-0" />
                                <span className="truncate">{person.companyName}</span>
                              </div>
                            ) : (
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {person._id.substring(0, 10)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell>
                        <Badge
                          variant={roleConf.badgeVariant}
                          className="gap-1 px-2 py-0.5 text-xs font-medium"
                        >
                          <RoleIcon className="h-3 w-3" />
                          <span>{roleKey}</span>
                        </Badge>
                      </TableCell>

                      {/* Group Badge */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("gap-1 px-2 py-0.5 text-[11px] font-normal", groupClass)}
                        >
                          <Tag className="h-2.5 w-2.5" />
                          <span>{groupKey}</span>
                        </Badge>
                      </TableCell>

                      {/* Phone & Email */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {displayPhone ? (
                            <div className="flex items-center gap-1.5 text-xs font-mono text-foreground">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{formatDisplayPhone(displayPhone)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                          {person.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate max-w-[200px]">
                              <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="truncate" title={person.email}>
                                {person.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Address */}
                      <TableCell>
                        {person.address ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-xs truncate">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate" title={person.address}>
                              {person.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Action Buttons */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEditModal(person)}
                            title="Edit Person"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteConfirmPerson(person)}
                            title="Delete Person"
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

      {/* Add / Edit Dialog Modal (Consistent 'Mark Paid'-style modal pattern) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                {editingPerson ? (
                  <Pencil className="h-5 w-5" />
                ) : (
                  <UserPlus className="h-5 w-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  {editingPerson ? 'Edit Person Details' : 'Add New Person'}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {editingPerson
                    ? 'Update profile details, contact numbers, and categorization.'
                    : 'Add a customer, supplier, staff member, vendor, or consultant.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Top Alert Error */}
          {formError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSavePerson} className="space-y-4 py-1">
            {/* Field 1: Full Name (required) */}
            <div className="space-y-1.5">
              <Label htmlFor="person-name" className="text-xs font-semibold">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="person-name"
                  name="name"
                  required
                  autoFocus
                  placeholder="e.g. Acme Logistics or Jane Doe"
                  value={formData.name}
                  onChange={handleFormChange}
                  className={cn(
                    "pl-9 h-9 text-xs",
                    fieldErrors.name && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            {/* Field 2 & 3: Role (dropdown) & Company Name (optional text) in a 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Field 2: Role (dropdown or inline new role creation) */}
              <div className="space-y-1.5">
                <Label htmlFor={isAddingCustomRole ? "new-role-input" : "person-role"} className="text-xs font-semibold">
                  Role <span className="text-destructive">*</span>
                </Label>
                {isAddingCustomRole ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="new-role-input"
                          placeholder="Type a new role"
                          value={newRoleInput}
                          onChange={(e) => {
                            setNewRoleInput(e.target.value);
                            if (newRoleError) setNewRoleError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveNewRole();
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancelNewRole();
                            }
                          }}
                          autoFocus
                          className={cn(
                            "pl-9 h-9 text-xs",
                            newRoleError && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveNewRole}
                        disabled={isSavingRole}
                        className="h-9 px-2.5 text-xs shadow-sm shrink-0"
                      >
                        {isSavingRole ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelNewRole}
                        disabled={isSavingRole}
                        className="h-9 px-2.5 text-xs shrink-0"
                      >
                        Cancel
                      </Button>
                    </div>
                    {newRoleError && (
                      <p className="text-[11px] text-destructive">{newRoleError}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <select
                        id="person-role"
                        name="role"
                        value={formData.role}
                        onChange={handleRoleSelectChange}
                        className={cn(
                          "flex h-9 w-full rounded-md border border-input bg-background text-foreground pl-9 pr-8 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                          fieldErrors.role && "border-destructive focus-visible:ring-destructive"
                        )}
                      >
                        {defaultRolesList.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                        {customRolesList.length > 0 && (
                          <>
                            {customRolesList.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </>
                        )}
                        <option disabled value="">
                          ──────────
                        </option>
                        <option value={ADD_ROLE_VALUE}>
                          + Add new role
                        </option>
                      </select>
                    </div>
                    {fieldErrors.role && (
                      <p className="text-[11px] text-destructive mt-1">{fieldErrors.role}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Field 3: Company Name (optional text) */}
              <div className="space-y-1.5">
                <Label htmlFor="person-companyName" className="text-xs font-semibold text-muted-foreground">
                  Company Name <span className="text-[10px] font-normal">(Optional)</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="person-companyName"
                    name="companyName"
                    placeholder="e.g. Global Tech Solutions"
                    value={formData.companyName}
                    onChange={handleFormChange}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Field 4 & 5: Phone (required, 10 digits) & Email (optional, validated format) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Field 4: Phone (required, validated to 10 digits) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="person-phone" className="text-xs font-semibold">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formData.phone.length}/10 digits
                  </span>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="person-phone"
                    name="phone"
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number (e.g. 9876543210)"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={cn(
                      "pl-9 h-9 text-xs font-mono",
                      fieldErrors.phone && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-[11px] text-destructive">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Field 5: Email (optional, validated email format) */}
              <div className="space-y-1.5">
                <Label htmlFor="person-email" className="text-xs font-semibold text-muted-foreground">
                  Email <span className="text-[10px] font-normal">(Optional)</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="person-email"
                    name="email"
                    type="email"
                    placeholder="e.g. contact@example.com"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={cn(
                      "pl-9 h-9 text-xs",
                      fieldErrors.email && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-destructive">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            {/* Field 6: Group (dropdown: No Group, Family, Friends, Clients, Vendors, Staff, Consultants) */}
            <div className="space-y-1.5">
              <Label htmlFor="person-group" className="text-xs font-semibold">
                Group
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                  id="person-group"
                  name="group"
                  value={formData.group}
                  onChange={handleFormChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground pl-9 pr-8 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {GROUPS.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field 7: Address (Keep Address as an existing field below these) */}
            <div className="space-y-1.5">
              <Label htmlFor="person-address" className="text-xs font-semibold text-muted-foreground">
                Street Address <span className="text-[10px] font-normal">(Optional)</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="person-address"
                  name="address"
                  placeholder="e.g. 742 Evergreen Terrace, Springfield, IL"
                  value={formData.address}
                  onChange={handleFormChange}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            {/* Modal Footer with Cancel & Submit buttons */}
            <DialogFooter className="gap-2 pt-3 border-t border-border mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 min-w-[110px]">
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    {editingPerson ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    <span>{editingPerson ? 'Save Changes' : 'Add Person'}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmPerson}
        onOpenChange={(open) => !open && setDeleteConfirmPerson(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle>Delete Person</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <strong className="text-foreground">
                {deleteConfirmPerson?.name}
              </strong>{' '}
              from your directory? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmPerson(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeletePerson}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Person'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
