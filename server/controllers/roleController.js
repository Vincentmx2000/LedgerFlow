import mongoose from 'mongoose';
import { Role } from '../models/Role.js';

export const DEFAULT_ROLES = ['Customer', 'Supplier', 'Staff', 'Vendor', 'Consultant'];

// In-memory fallback dataset for seamless dev testing when MongoDB is offline
let inMemoryRoles = [];

export const getInMemoryRoles = () => inMemoryRoles;

// @desc    Get all roles (5 default roles first, then user's custom roles)
// @route   GET /api/roles
// @access  Private
export const getRoles = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    // Use MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const customRoles = await Role.find({ user: req.user._id }).sort({ createdAt: 1 });
      const customNames = customRoles.map((r) => r.name);

      // Filter out any case-insensitive duplicates of default roles
      const uniqueCustomNames = customNames.filter(
        (name) => !DEFAULT_ROLES.some((def) => def.toLowerCase() === name.toLowerCase())
      );

      const allRoles = [...DEFAULT_ROLES, ...uniqueCustomNames];

      return res.status(200).json({
        success: true,
        count: allRoles.length,
        data: allRoles,
        roles: allRoles,
        defaultRoles: DEFAULT_ROLES,
        customRoles: uniqueCustomNames,
      });
    }

    // In-memory fallback
    const userCustomRoles = inMemoryRoles.filter(
      (r) => r.user === userId || r.user === 'dev_user_demo_01'
    );
    const customNames = userCustomRoles.map((r) => r.name);
    const uniqueCustomNames = customNames.filter(
      (name) => !DEFAULT_ROLES.some((def) => def.toLowerCase() === name.toLowerCase())
    );
    const allRoles = [...DEFAULT_ROLES, ...uniqueCustomNames];

    return res.status(200).json({
      success: true,
      count: allRoles.length,
      data: allRoles,
      roles: allRoles,
      defaultRoles: DEFAULT_ROLES,
      customRoles: uniqueCustomNames,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom role
// @route   POST /api/roles
// @access  Private
export const createRole = async (req, res, next) => {
  try {
    const rawInput = req.body.name !== undefined ? req.body.name : req.body.role;
    const trimmedName = (rawInput || '').toString().trim();

    // 1. Reject empty names
    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: 'Role name cannot be empty',
      });
    }

    // 2. Validate length
    if (trimmedName.length < 2 || trimmedName.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Role name must be between 2 and 30 characters',
      });
    }

    // 3. Reject duplicates against default roles (ignoring upper/lower case)
    const isDefault = DEFAULT_ROLES.some(
      (def) => def.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDefault) {
      return res.status(400).json({
        success: false,
        message: 'This role already exists.',
      });
    }

    // 4. Check & save in MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const escapedName = trimmedName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const existingRole = await Role.findOne({
        user: req.user._id,
        name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
      });

      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'This role already exists.',
        });
      }

      const roleDoc = await Role.create({
        user: req.user._id,
        name: trimmedName,
      });

      return res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: roleDoc,
        name: roleDoc.name,
      });
    }

    // 5. In-memory fallback
    const userId = req.user._id.toString();
    const existingInMemory = inMemoryRoles.find(
      (r) =>
        (r.user === userId || r.user === 'dev_user_demo_01') &&
        r.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingInMemory) {
      return res.status(400).json({
        success: false,
        message: 'This role already exists.',
      });
    }

    const roleDoc = {
      _id: `role_${Date.now()}`,
      user: userId,
      name: trimmedName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryRoles.push(roleDoc);

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: roleDoc,
      name: roleDoc.name,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This role already exists.',
      });
    }
    next(error);
  }
};
