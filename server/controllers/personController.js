import mongoose from 'mongoose';
import { Person } from '../models/Person.js';

// In-memory fallback dataset for seamless dev testing when MongoDB is offline
let inMemoryPeople = [
  {
    _id: 'person_sample_01',
    user: 'dev_user_demo_01',
    name: 'Acme Logistics Inc.',
    role: 'Customer',
    type: 'Customer',
    companyName: 'Acme Global Freight Ltd',
    phone: '5552345678',
    mobile: '5552345678',
    email: 'billing@acmelogistics.com',
    group: 'Clients',
    address: '742 Evergreen Terrace, Springfield, IL',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 5),
  },
  {
    _id: 'person_sample_02',
    user: 'dev_user_demo_01',
    name: 'Global Office Supplies Co.',
    role: 'Supplier',
    type: 'Supplier',
    companyName: 'Apex Paper & Tech Solutions',
    phone: '5558765432',
    mobile: '5558765432',
    email: 'orders@globalofficesupply.com',
    group: 'Vendors',
    address: '100 Industrial Parkway, Suite 12B, Austin, TX',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3),
  },
  {
    _id: 'person_sample_03',
    user: 'dev_user_demo_01',
    name: 'Marcus Vance',
    role: 'Staff',
    type: 'Staff',
    companyName: 'LedgerFlow Operations',
    phone: '5553456789',
    mobile: '5553456789',
    email: 'marcus.v@ledgerflow.io',
    group: 'Staff',
    address: 'Suite 400, Financial District, New York, NY',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 1),
  },
  {
    _id: 'person_sample_04',
    user: 'dev_user_demo_01',
    name: 'Nexus Cloud Infrastructure',
    role: 'Vendor',
    type: 'Vendor',
    companyName: 'Nexus Cloud Technologies',
    phone: '5559871234',
    mobile: '5559871234',
    email: 'support@nexuscloud.net',
    group: 'Vendors',
    address: '500 Silicon Alley, San Jose, CA',
    createdAt: new Date(Date.now() - 3600000 * 12),
    updatedAt: new Date(Date.now() - 3600000 * 12),
  },
  {
    _id: 'person_sample_05',
    user: 'dev_user_demo_01',
    name: 'Elena Rostova',
    role: 'Consultant',
    type: 'Consultant',
    companyName: 'Rostova Tax Advisory Group',
    phone: '5554329876',
    mobile: '5554329876',
    email: 'elena@rostovatax.com',
    group: 'Consultants',
    address: '88 Market Street, Suite 900, Chicago, IL',
    createdAt: new Date(Date.now() - 3600000 * 6),
    updatedAt: new Date(Date.now() - 3600000 * 6),
  },
];

const VALID_GROUPS = [
  'No Group',
  'Family',
  'Friends',
  'Clients',
  'Vendors',
  'Staff',
  'Consultants',
];

export const getInMemoryPersonById = (id) => {
  return inMemoryPeople.find((p) => p._id === id);
};

// @desc    Get all people (with search, role/type, and group filters)
// @route   GET /api/people
// @access  Private
export const getPeople = async (req, res, next) => {
  try {
    const { type, role, group, search } = req.query;
    const userId = req.user._id.toString();
    const filterRole = role || type;

    // Use MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const query = { user: req.user._id };

      // Role / Type filter
      if (filterRole && filterRole !== 'All') {
        query.$or = [{ role: filterRole }, { type: filterRole }];
      }

      // Group filter
      if (group && group !== 'All') {
        query.group = group;
      }

      // Text search across all fields
      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        const textQuery = [
          { name: searchRegex },
          { companyName: searchRegex },
          { phone: searchRegex },
          { mobile: searchRegex },
          { email: searchRegex },
          { group: searchRegex },
          { role: searchRegex },
          { type: searchRegex },
          { address: searchRegex },
        ];

        if (query.$or) {
          query.$and = [{ $or: query.$or }, { $or: textQuery }];
          delete query.$or;
        } else {
          query.$or = textQuery;
        }
      }

      const people = await Person.find(query).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: people.length,
        data: people,
      });
    }

    // In-memory fallback
    let filtered = inMemoryPeople.filter(
      (p) => p.user === userId || p.user === 'dev_user_demo_01'
    );

    if (filterRole && filterRole !== 'All') {
      filtered = filtered.filter(
        (p) => p.role === filterRole || p.type === filterRole
      );
    }

    if (group && group !== 'All') {
      filtered = filtered.filter((p) => p.group === group);
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          (p.companyName && p.companyName.toLowerCase().includes(s)) ||
          (p.phone && p.phone.toLowerCase().includes(s)) ||
          (p.mobile && p.mobile.toLowerCase().includes(s)) ||
          (p.email && p.email.toLowerCase().includes(s)) ||
          (p.group && p.group.toLowerCase().includes(s)) ||
          (p.role && p.role.toLowerCase().includes(s)) ||
          (p.type && p.type.toLowerCase().includes(s)) ||
          (p.address && p.address.toLowerCase().includes(s))
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single person by ID
// @route   GET /api/people/:id
// @access  Private
export const getPersonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const person = await Person.findOne({
        _id: id,
        user: req.user._id,
      });

      if (!person) {
        return res.status(404).json({
          success: false,
          message: 'Person not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: person,
      });
    }

    // In-memory fallback
    const person = inMemoryPeople.find((p) => p._id === id);
    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Person not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: person,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Add a new person
// @route   POST /api/people
// @access  Private
export const createPerson = async (req, res, next) => {
  try {
    const { name, role, type, companyName, phone, mobile, email, group, address } = req.body;

    // 1. Validate Full Name (required)
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full Name is required',
      });
    }

    // 2. Validate Role (any text, trimmed, 2 to 30 characters)
    const rawRole = (role || type || 'Customer').toString().trim();
    if (!rawRole || rawRole.length < 2 || rawRole.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Role is required and must be between 2 and 30 characters',
      });
    }
    const selectedRole = rawRole;

    // 3. Validate Phone (required, validated to 10 digits)
    const rawPhone = phone || mobile || '';
    const cleanPhone = rawPhone.toString().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required and must be exactly 10 digits',
      });
    }

    // 4. Validate Email (optional, validated email format)
    const cleanEmail = (email || '').toString().trim().toLowerCase();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format (e.g. name@example.com)',
      });
    }

    // 5. Validate Group (dropdown: No Group, Family, Friends, Clients, Vendors, Staff, Consultants)
    const selectedGroup = group && VALID_GROUPS.includes(group) ? group : 'No Group';

    const cleanCompanyName = companyName ? companyName.toString().trim() : '';
    const cleanAddress = address ? address.toString().trim() : '';

    if (mongoose.connection.readyState === 1) {
      const newPerson = await Person.create({
        user: req.user._id,
        name: name.trim(),
        role: selectedRole,
        type: selectedRole,
        companyName: cleanCompanyName,
        phone: cleanPhone,
        mobile: cleanPhone,
        email: cleanEmail,
        group: selectedGroup,
        address: cleanAddress,
      });

      return res.status(201).json({
        success: true,
        message: `${name.trim()} added successfully`,
        data: newPerson,
      });
    }

    // In-memory fallback
    const newPerson = {
      _id: `person_${Date.now()}`,
      user: req.user._id.toString(),
      name: name.trim(),
      role: selectedRole,
      type: selectedRole,
      companyName: cleanCompanyName,
      phone: cleanPhone,
      mobile: cleanPhone,
      email: cleanEmail,
      group: selectedGroup,
      address: cleanAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryPeople.unshift(newPerson);

    return res.status(201).json({
      success: true,
      message: `${name.trim()} added successfully`,
      data: newPerson,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a person
// @route   PUT /api/people/:id
// @access  Private
export const updatePerson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, type, companyName, phone, mobile, email, group, address } = req.body;

    // 1. Validate Name if provided
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full Name cannot be empty',
      });
    }

    // 2. Validate Role if provided (any text, trimmed, 2 to 30 characters)
    let selectedRole = undefined;
    if (role !== undefined || type !== undefined) {
      const rawRole = (role !== undefined ? role : type).toString().trim();
      if (!rawRole || rawRole.length < 2 || rawRole.length > 30) {
        return res.status(400).json({
          success: false,
          message: 'Role must be between 2 and 30 characters',
        });
      }
      selectedRole = rawRole;
    }

    // 3. Validate Phone if provided
    let cleanPhone = undefined;
    if (phone !== undefined || mobile !== undefined) {
      const rawPhone = phone !== undefined ? phone : mobile;
      cleanPhone = rawPhone.toString().replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required and must be exactly 10 digits',
        });
      }
    }

    // 4. Validate Email if provided
    let cleanEmail = undefined;
    if (email !== undefined) {
      cleanEmail = email.toString().trim().toLowerCase();
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address format (e.g. name@example.com)',
        });
      }
    }

    // 5. Validate Group if provided
    let selectedGroup = undefined;
    if (group !== undefined) {
      if (VALID_GROUPS.includes(group)) {
        selectedGroup = group;
      } else {
        selectedGroup = 'No Group';
      }
    }

    if (mongoose.connection.readyState === 1) {
      const person = await Person.findOne({
        _id: id,
        user: req.user._id,
      });

      if (!person) {
        return res.status(404).json({
          success: false,
          message: 'Person not found',
        });
      }

      if (name !== undefined) person.name = name.trim();
      if (selectedRole) {
        person.role = selectedRole;
        person.type = selectedRole;
      }
      if (companyName !== undefined) person.companyName = companyName.toString().trim();
      if (cleanPhone !== undefined) {
        person.phone = cleanPhone;
        person.mobile = cleanPhone;
      }
      if (cleanEmail !== undefined) person.email = cleanEmail;
      if (selectedGroup !== undefined) person.group = selectedGroup;
      if (address !== undefined) person.address = address.toString().trim();

      const updated = await person.save();

      return res.status(200).json({
        success: true,
        message: 'Person updated successfully',
        data: updated,
      });
    }

    // In-memory fallback
    const person = inMemoryPeople.find((p) => p._id === id);
    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Person not found',
      });
    }

    if (name !== undefined) person.name = name.trim();
    if (selectedRole) {
      person.role = selectedRole;
      person.type = selectedRole;
    }
    if (companyName !== undefined) person.companyName = companyName.toString().trim();
    if (cleanPhone !== undefined) {
      person.phone = cleanPhone;
      person.mobile = cleanPhone;
    }
    if (cleanEmail !== undefined) person.email = cleanEmail;
    if (selectedGroup !== undefined) person.group = selectedGroup;
    if (address !== undefined) person.address = address.toString().trim();
    person.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: 'Person updated successfully',
      data: person,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a person
// @route   DELETE /api/people/:id
// @access  Private
export const deletePerson = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const person = await Person.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });

      if (!person) {
        return res.status(404).json({
          success: false,
          message: 'Person not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Person removed successfully',
      });
    }

    // In-memory fallback
    const index = inMemoryPeople.findIndex((p) => p._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Person not found',
      });
    }

    inMemoryPeople.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Person removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
