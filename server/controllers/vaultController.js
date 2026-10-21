import mongoose from 'mongoose';
import { Vault } from '../models/Vault.js';

const VALID_STATUSES = ['In Progress', 'Target Met', 'Claimed'];

// In-memory fallback dataset for dev testing when MongoDB is offline
let inMemoryVaults = [
  {
    _id: 'vault_sample_01',
    user: 'dev_user_demo_01',
    name: 'Emergency Contingency Reserve',
    targetAmount: 50000.00,
    description: 'Liquid cash cushion for unexpected business shocks, delayed client payments, and operating buffers.',
    currentAllocated: 32500.00,
    status: 'In Progress',
    createdAt: new Date(Date.now() - 3600000 * 24 * 10),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2),
  },
  {
    _id: 'vault_sample_02',
    user: 'dev_user_demo_01',
    name: 'Annual Tax Provision',
    targetAmount: 25000.00,
    description: 'Earmarked funds for advance quarterly GST settlements and annual corporate income taxation.',
    currentAllocated: 25000.00,
    status: 'Target Met',
    createdAt: new Date(Date.now() - 3600000 * 24 * 20),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 1),
  },
  {
    _id: 'vault_sample_03',
    user: 'dev_user_demo_01',
    name: 'Workstation & IT Upgrades',
    targetAmount: 40000.00,
    description: 'Hardware procurement, M-series developer laptops, 4K monitors, and ergonomic setups.',
    currentAllocated: 40000.00,
    status: 'Claimed',
    createdAt: new Date(Date.now() - 3600000 * 24 * 35),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 5),
  },
  {
    _id: 'vault_sample_04',
    user: 'dev_user_demo_01',
    name: 'Marketing Expansion Fund',
    targetAmount: 15000.00,
    description: 'Q4 lead generation campaigns, sponsored webinars, and search engine advertising.',
    currentAllocated: 6000.00,
    status: 'In Progress',
    createdAt: new Date(Date.now() - 3600000 * 24 * 6),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 1),
  },
];

// Helper to sanitize vault object
const formatVault = (v) => ({
  ...v,
  targetAmount: Number(v.targetAmount),
  currentAllocated: Number(v.currentAllocated || 0),
});

// @desc    Get all vaults (filterable by status)
// @route   GET /api/vaults
// @access  Private
export const getVaults = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const userId = req.user._id.toString();

    // Use MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      // Normalize any invalid claimed vaults back to In Progress
      await Vault.updateMany(
        {
          user: req.user._id,
          status: 'Claimed',
          $expr: { $lt: ['$currentAllocated', '$targetAmount'] },
        },
        { $set: { status: 'In Progress' } }
      );

      const query = { user: req.user._id };

      if (status && status !== 'All') {
        query.status = status;
      }

      if (search && search.trim()) {
        query.name = new RegExp(search.trim(), 'i');
      }

      const vaults = await Vault.find(query).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: vaults.length,
        data: vaults,
      });
    }

    // In-memory fallback
    inMemoryVaults.forEach((v) => {
      if (v.status === 'Claimed' && Number(v.currentAllocated || 0) < Number(v.targetAmount)) {
        v.status = 'In Progress';
      }
    });

    let filtered = inMemoryVaults.filter(
      (v) => v.user === userId || v.user === 'dev_user_demo_01'
    );

    if (status && status !== 'All') {
      filtered = filtered.filter((v) => v.status === status);
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(s) ||
          (v.description && v.description.toLowerCase().includes(s))
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered.map(formatVault),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vault by ID
// @route   GET /api/vaults/:id
// @access  Private
export const getVaultById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const vault = await Vault.findOne({
        _id: id,
        user: req.user._id,
      });

      if (!vault) {
        return res.status(404).json({
          success: false,
          message: 'Vault not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: vault,
      });
    }

    // In-memory fallback
    const vault = inMemoryVaults.find((v) => v._id === id);
    if (!vault) {
      return res.status(404).json({
        success: false,
        message: 'Vault not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatVault(vault),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new vault
// @route   POST /api/vaults
// @access  Private
export const createVault = async (req, res, next) => {
  try {
    const { name, targetAmount, description, currentAllocated = 0 } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a vault name',
      });
    }

    const numericTarget = Number(targetAmount);
    if (isNaN(numericTarget) || numericTarget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a target amount greater than 0',
      });
    }

    const numericAllocated = Math.max(0, Number(currentAllocated) || 0);

    // Initial status determination
    const initialStatus = numericAllocated >= numericTarget ? 'Target Met' : 'In Progress';

    if (mongoose.connection.readyState === 1) {
      const vault = await Vault.create({
        user: req.user._id,
        name: name.trim(),
        targetAmount: numericTarget,
        description: description ? description.trim() : '',
        currentAllocated: numericAllocated,
        status: initialStatus,
      });

      return res.status(201).json({
        success: true,
        message: `Vault '${vault.name}' created successfully`,
        data: vault,
      });
    }

    // In-memory fallback
    const newVault = {
      _id: `vault_${Date.now()}`,
      user: req.user._id.toString(),
      name: name.trim(),
      targetAmount: numericTarget,
      description: description ? description.trim() : '',
      currentAllocated: numericAllocated,
      status: initialStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryVaults.unshift(newVault);

    return res.status(201).json({
      success: true,
      message: `Vault '${newVault.name}' created successfully`,
      data: formatVault(newVault),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add cash to a vault (increments currentAllocated and auto-updates status to 'Target Met' when target is reached)
// @route   POST /api/vaults/:id/add-cash
// @access  Private
export const addCashToVault = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid cash allocation amount greater than 0',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const vault = await Vault.findOne({
        _id: id,
        user: req.user._id,
      });

      if (!vault) {
        return res.status(404).json({
          success: false,
          message: 'Vault not found',
        });
      }

      if (vault.status === 'Claimed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot add cash to a claimed vault',
        });
      }

      vault.currentAllocated = Number(vault.currentAllocated || 0) + numericAmount;

      // Auto-update status to 'Target Met' when currentAllocated reaches targetAmount
      if (vault.currentAllocated >= vault.targetAmount && vault.status === 'In Progress') {
        vault.status = 'Target Met';
      }

      await vault.save();

      return res.status(200).json({
        success: true,
        message: `Added funds to '${vault.name}' successfully`,
        data: vault,
      });
    }

    // In-memory fallback
    const vault = inMemoryVaults.find((v) => v._id === id);
    if (!vault) {
      return res.status(404).json({
        success: false,
        message: 'Vault not found',
      });
    }

    if (vault.status === 'Claimed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add cash to a claimed vault',
      });
    }

    vault.currentAllocated = Number(vault.currentAllocated || 0) + numericAmount;

    // Auto-update status to 'Target Met' when currentAllocated reaches targetAmount
    if (vault.currentAllocated >= vault.targetAmount && vault.status === 'In Progress') {
      vault.status = 'Target Met';
    }

    vault.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: `Added funds to '${vault.name}' successfully`,
      data: formatVault(vault),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a vault as 'Claimed'
// @route   PUT /api/vaults/:id/claim
// @access  Private
export const claimVault = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const vault = await Vault.findOne({
        _id: id,
        user: req.user._id,
      });

      if (!vault) {
        return res.status(404).json({
          success: false,
          message: 'Vault not found',
        });
      }

      // Check that currentAllocated >= targetAmount from saved record
      const allocated = Number(vault.currentAllocated || 0);
      const target = Number(vault.targetAmount);

      if (allocated < target) {
        return res.status(400).json({
          success: false,
          message: 'Vault can only be claimed after the target amount is reached.',
        });
      }

      // Reject if already Claimed
      if (vault.status === 'Claimed') {
        return res.status(400).json({
          success: false,
          message: 'Vault is already claimed.',
        });
      }

      vault.status = 'Claimed';
      await vault.save();

      return res.status(200).json({
        success: true,
        message: `Vault '${vault.name}' marked as Claimed`,
        data: vault,
      });
    }

    // In-memory fallback
    const vault = inMemoryVaults.find((v) => v._id === id);
    if (!vault) {
      return res.status(404).json({
        success: false,
        message: 'Vault not found',
      });
    }

    const allocated = Number(vault.currentAllocated || 0);
    const target = Number(vault.targetAmount);

    if (allocated < target) {
      return res.status(400).json({
        success: false,
        message: 'Vault can only be claimed after the target amount is reached.',
      });
    }

    if (vault.status === 'Claimed') {
      return res.status(400).json({
        success: false,
        message: 'Vault is already claimed.',
      });
    }

    vault.status = 'Claimed';
    vault.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: `Vault '${vault.name}' marked as Claimed`,
      data: formatVault(vault),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a vault
// @route   DELETE /api/vaults/:id
// @access  Private
export const deleteVault = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const vault = await Vault.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });

      if (!vault) {
        return res.status(404).json({
          success: false,
          message: 'Vault not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: `Vault deleted successfully`,
      });
    }

    // In-memory fallback
    const index = inMemoryVaults.findIndex((v) => v._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Vault not found',
      });
    }

    inMemoryVaults.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: `Vault deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
