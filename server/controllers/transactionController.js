import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction.js';
import { getInMemoryPersonById } from './personController.js';

// In-memory fallback dataset for seamless dev testing when MongoDB is offline
let inMemoryTransactions = [
  {
    _id: 'tx_sample_01',
    user: 'dev_user_demo_01',
    type: 'Sale',
    party: 'person_sample_01',
    amount: 4250.00,
    date: new Date(Date.now() - 3600000 * 2),
    notes: 'Enterprise accounting software integration consulting',
    createdAt: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    _id: 'tx_sample_02',
    user: 'dev_user_demo_01',
    type: 'Purchase',
    party: 'person_sample_02',
    amount: 840.50,
    date: new Date(Date.now() - 3600000 * 24 * 2),
    notes: 'Quarterly office stationery, printers & network cables',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2),
  },
  {
    _id: 'tx_sample_03',
    user: 'dev_user_demo_01',
    type: 'Expense',
    party: null,
    amount: 280.00,
    date: new Date(Date.now() - 3600000 * 24 * 3),
    notes: 'Cloud server hosting & SSL certificates maintenance',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3),
  },
  {
    _id: 'tx_sample_04',
    user: 'dev_user_demo_01',
    type: 'Receipt',
    party: 'person_sample_01',
    amount: 2500.00,
    date: new Date(Date.now() - 3600000 * 24 * 5),
    notes: 'Direct client wire payment against Invoice #INV-2026-04',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 5),
  },
  {
    _id: 'tx_sample_05',
    user: 'dev_user_demo_01',
    type: 'Payment',
    party: 'person_sample_02',
    amount: 600.00,
    date: new Date(Date.now() - 3600000 * 24 * 6),
    notes: 'Vendor payment settlement for invoice #VEND-889',
    createdAt: new Date(Date.now() - 3600000 * 24 * 6),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 6),
  },
];

// Helper to populate in-memory party
const populateInMemoryTransaction = (tx) => {
  let partyObj = null;
  if (tx.party) {
    const p = getInMemoryPersonById(tx.party);
    if (p) {
      partyObj = {
        _id: p._id,
        name: p.name,
        type: p.type,
        mobile: p.mobile,
      };
    }
  }

  return {
    ...tx,
    party: partyObj,
  };
};

const VALID_TYPES = ['Sale', 'Purchase', 'Payment', 'Receipt', 'Expense'];

// @desc    Get all transactions (filterable by type and search query)
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const { type, search, party } = req.query;
    const userId = req.user._id.toString();

    // Use MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const query = { user: req.user._id };

      if (type && type !== 'All') {
        query.type = type;
      }

      if (party) {
        query.party = party;
      }

      if (search && search.trim()) {
        query.notes = new RegExp(search.trim(), 'i');
      }

      const transactions = await Transaction.find(query)
        .populate('party', 'name type mobile')
        .sort({ date: -1, createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions,
      });
    }

    // In-memory fallback
    let filtered = inMemoryTransactions.filter(
      (tx) => tx.user === userId || tx.user === 'dev_user_demo_01'
    );

    if (type && type !== 'All') {
      filtered = filtered.filter((tx) => tx.type === type);
    }

    if (party) {
      filtered = filtered.filter((tx) => tx.party === party);
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          (tx.notes && tx.notes.toLowerCase().includes(s)) ||
          tx.type.toLowerCase().includes(s) ||
          tx.amount.toString().includes(s)
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Populate party
    const populated = filtered.map(populateInMemoryTransaction);

    return res.status(200).json({
      success: true,
      count: populated.length,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const tx = await Transaction.findOne({
        _id: id,
        user: req.user._id,
      }).populate('party', 'name type mobile');

      if (!tx) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: tx,
      });
    }

    // In-memory fallback
    const tx = inMemoryTransactions.find((t) => t._id === id);
    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: populateInMemoryTransaction(tx),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res, next) => {
  try {
    const { type, party, amount, date, notes } = req.body;

    if (!type || !VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Please specify a valid transaction type: ${VALID_TYPES.join(', ')}`,
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount greater than 0',
      });
    }

    const txDate = date ? new Date(date) : new Date();
    if (isNaN(txDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date',
      });
    }

    // Valid party or null
    const validParty = party && party !== 'none' && party !== '' ? party : null;

    if (mongoose.connection.readyState === 1) {
      const newTx = await Transaction.create({
        user: req.user._id,
        type,
        party: validParty,
        amount: numericAmount,
        date: txDate,
        notes: notes ? notes.trim() : '',
      });

      const populatedTx = await Transaction.findById(newTx._id)
        .populate('party', 'name type mobile');

      return res.status(201).json({
        success: true,
        message: `${type} transaction created successfully`,
        data: populatedTx,
      });
    }

    // In-memory fallback
    const newTx = {
      _id: `tx_${Date.now()}`,
      user: req.user._id.toString(),
      type,
      party: validParty,
      amount: numericAmount,
      date: txDate,
      notes: notes ? notes.trim() : '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryTransactions.unshift(newTx);

    return res.status(201).json({
      success: true,
      message: `${type} transaction created successfully`,
      data: populateInMemoryTransaction(newTx),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, party, amount, date, notes } = req.body;

    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Please specify a valid transaction type: ${VALID_TYPES.join(', ')}`,
      });
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0',
        });
      }
    }

    if (date !== undefined) {
      const txDate = new Date(date);
      if (isNaN(txDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid date',
        });
      }
    }

    if (mongoose.connection.readyState === 1) {
      const tx = await Transaction.findOne({
        _id: id,
        user: req.user._id,
      });

      if (!tx) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      if (type) tx.type = type;
      if (party !== undefined) {
        tx.party = party && party !== 'none' && party !== '' ? party : null;
      }
      if (amount !== undefined) tx.amount = Number(amount);
      if (date !== undefined) tx.date = new Date(date);
      if (notes !== undefined) tx.notes = notes.trim();

      await tx.save();

      const populated = await Transaction.findById(tx._id)
        .populate('party', 'name type mobile');

      return res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        data: populated,
      });
    }

    // In-memory fallback
    const tx = inMemoryTransactions.find((t) => t._id === id);
    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (type) tx.type = type;
    if (party !== undefined) {
      tx.party = party && party !== 'none' && party !== '' ? party : null;
    }
    if (amount !== undefined) tx.amount = Number(amount);
    if (date !== undefined) tx.date = new Date(date);
    if (notes !== undefined) tx.notes = notes.trim();
    tx.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: populateInMemoryTransaction(tx),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const tx = await Transaction.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });

      if (!tx) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully',
      });
    }

    // In-memory fallback
    const index = inMemoryTransactions.findIndex((t) => t._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    inMemoryTransactions.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
