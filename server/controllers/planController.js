import mongoose from 'mongoose';
import { Plan } from '../models/Plan.js';
import { getInMemoryPersonById } from './personController.js';

const VALID_ACTIVITY_TYPES = ['Payment', 'Collection', 'Expense', 'Other'];
const VALID_STATUSES = ['Upcoming', 'Completed'];

// In-memory fallback dataset for seamless dev testing when MongoDB is offline
let inMemoryPlans = [
  {
    _id: 'plan_sample_01',
    user: 'dev_user_demo_01',
    activityType: 'Collection',
    amount: 5200.00,
    scheduledDate: new Date(Date.now() + 3600000 * 24 * 2), // 2 days in future
    party: 'person_sample_01', // Acme Logistics Inc.
    notes: 'Q4 Consulting retainer milestone receivable collection',
    status: 'Upcoming',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 1),
  },
  {
    _id: 'plan_sample_02',
    user: 'dev_user_demo_01',
    activityType: 'Payment',
    amount: 1450.00,
    scheduledDate: new Date(Date.now() + 3600000 * 24 * 5), // 5 days in future
    party: 'person_sample_02', // Global Office Supplies
    notes: 'Bulk office furniture & printing equipment quarterly payment',
    status: 'Upcoming',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2),
  },
  {
    _id: 'plan_sample_03',
    user: 'dev_user_demo_01',
    activityType: 'Expense',
    amount: 380.00,
    scheduledDate: new Date(Date.now() + 3600000 * 24 * 7), // 7 days in future
    party: null,
    notes: 'Annual SSL security certificates and cloud domain renewals',
    status: 'Upcoming',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3),
  },
  {
    _id: 'plan_sample_04',
    user: 'dev_user_demo_01',
    activityType: 'Payment',
    amount: 850.00,
    scheduledDate: new Date(Date.now() - 3600000 * 24 * 2), // 2 days ago
    party: 'person_sample_03', // Marcus Vance (Staff)
    notes: 'Monthly contractor accounting audit & advisory fees settlement',
    status: 'Completed',
    createdAt: new Date(Date.now() - 3600000 * 24 * 8),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2),
  },
];

// Helper to populate in-memory party
const populateInMemoryPlan = (plan) => {
  let partyObj = null;
  const partyId = typeof plan.party === 'object' && plan.party ? plan.party._id : plan.party;
  if (partyId) {
    const p = getInMemoryPersonById(partyId);
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
    ...plan,
    amount: Number(plan.amount),
    party: partyObj,
  };
};

// @desc    Get all plans (filterable by status, activityType, and search query)
// @route   GET /api/plans
// @access  Private
export const getPlans = async (req, res, next) => {
  try {
    const { status, activityType, search } = req.query;
    const userId = req.user._id.toString();

    // Use MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const query = { user: req.user._id };

      if (status && status !== 'All') {
        query.status = status;
      }

      if (activityType && activityType !== 'All') {
        query.activityType = activityType;
      }

      if (search && search.trim()) {
        query.notes = new RegExp(search.trim(), 'i');
      }

      // Sort by scheduledDate ascending (chronological order)
      const plans = await Plan.find(query)
        .populate('party', 'name type mobile')
        .sort({ scheduledDate: 1, createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: plans.length,
        data: plans,
      });
    }

    // In-memory fallback
    let filtered = inMemoryPlans.filter(
      (p) => p.user === userId || p.user === 'dev_user_demo_01'
    );

    if (status && status !== 'All') {
      filtered = filtered.filter((p) => p.status === status);
    }

    if (activityType && activityType !== 'All') {
      filtered = filtered.filter((p) => p.activityType === activityType);
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.notes && p.notes.toLowerCase().includes(s)) ||
          p.activityType.toLowerCase().includes(s) ||
          p.amount.toString().includes(s)
      );
    }

    // Sort by scheduledDate ascending
    filtered.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    const populated = filtered.map(populateInMemoryPlan);

    return res.status(200).json({
      success: true,
      count: populated.length,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single plan by ID
// @route   GET /api/plans/:id
// @access  Private
export const getPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const plan = await Plan.findOne({
        _id: id,
        user: req.user._id,
      }).populate('party', 'name type mobile');

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: plan,
      });
    }

    // In-memory fallback
    const plan = inMemoryPlans.find((p) => p._id === id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: populateInMemoryPlan(plan),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new plan
// @route   POST /api/plans
// @access  Private
export const createPlan = async (req, res, next) => {
  try {
    const { activityType, amount, scheduledDate, party, notes, status } = req.body;

    if (!activityType || !VALID_ACTIVITY_TYPES.includes(activityType)) {
      return res.status(400).json({
        success: false,
        message: `Please specify a valid activity type: ${VALID_ACTIVITY_TYPES.join(', ')}`,
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount greater than 0',
      });
    }

    const planDate = scheduledDate ? new Date(scheduledDate) : new Date();
    if (isNaN(planDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid scheduled date',
      });
    }

    const validParty = party && party !== 'none' && party !== '' ? party : null;
    const planStatus = status && VALID_STATUSES.includes(status) ? status : 'Upcoming';

    if (mongoose.connection.readyState === 1) {
      const newPlan = await Plan.create({
        user: req.user._id,
        activityType,
        amount: numericAmount,
        scheduledDate: planDate,
        party: validParty,
        notes: notes ? notes.trim() : '',
        status: planStatus,
      });

      const populated = await Plan.findById(newPlan._id).populate(
        'party',
        'name type mobile'
      );

      return res.status(201).json({
        success: true,
        message: `${activityType} plan created successfully`,
        data: populated,
      });
    }

    // In-memory fallback
    const newPlan = {
      _id: `plan_${Date.now()}`,
      user: req.user._id.toString(),
      activityType,
      amount: numericAmount,
      scheduledDate: planDate,
      party: validParty,
      notes: notes ? notes.trim() : '',
      status: planStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryPlans.unshift(newPlan);

    return res.status(201).json({
      success: true,
      message: `${activityType} plan created successfully`,
      data: populateInMemoryPlan(newPlan),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update / Edit a plan
// @route   PUT /api/plans/:id
// @access  Private
export const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activityType, amount, scheduledDate, party, notes, status } = req.body;

    if (activityType && !VALID_ACTIVITY_TYPES.includes(activityType)) {
      return res.status(400).json({
        success: false,
        message: `Please specify a valid activity type: ${VALID_ACTIVITY_TYPES.join(', ')}`,
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

    if (scheduledDate !== undefined) {
      const planDate = new Date(scheduledDate);
      if (isNaN(planDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid scheduled date',
        });
      }
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Please specify a valid status: ${VALID_STATUSES.join(', ')}`,
      });
    }

    if (mongoose.connection.readyState === 1) {
      const plan = await Plan.findOne({
        _id: id,
        user: req.user._id,
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found',
        });
      }

      if (activityType) plan.activityType = activityType;
      if (amount !== undefined) plan.amount = Number(amount);
      if (scheduledDate !== undefined) plan.scheduledDate = new Date(scheduledDate);
      if (party !== undefined) {
        plan.party = party && party !== 'none' && party !== '' ? party : null;
      }
      if (notes !== undefined) plan.notes = notes.trim();
      if (status) plan.status = status;

      await plan.save();

      const populated = await Plan.findById(plan._id).populate(
        'party',
        'name type mobile'
      );

      return res.status(200).json({
        success: true,
        message: 'Plan updated successfully',
        data: populated,
      });
    }

    // In-memory fallback
    const plan = inMemoryPlans.find((p) => p._id === id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    if (activityType) plan.activityType = activityType;
    if (amount !== undefined) plan.amount = Number(amount);
    if (scheduledDate !== undefined) plan.scheduledDate = new Date(scheduledDate);
    if (party !== undefined) {
      plan.party = party && party !== 'none' && party !== '' ? party : null;
    }
    if (notes !== undefined) plan.notes = notes.trim();
    if (status) plan.status = status;
    plan.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: populateInMemoryPlan(plan),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a plan as completed
// @route   PUT /api/plans/:id/complete
// @access  Private
export const markPlanCompleted = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetStatus = req.body.status || 'Completed';

    if (!VALID_STATUSES.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    if (mongoose.connection.readyState === 1) {
      const plan = await Plan.findOne({
        _id: id,
        user: req.user._id,
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found',
        });
      }

      plan.status = targetStatus;
      await plan.save();

      const populated = await Plan.findById(plan._id).populate(
        'party',
        'name type mobile'
      );

      return res.status(200).json({
        success: true,
        message: `Plan marked as ${targetStatus}`,
        data: populated,
      });
    }

    // In-memory fallback
    const plan = inMemoryPlans.find((p) => p._id === id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    plan.status = targetStatus;
    plan.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: `Plan marked as ${targetStatus}`,
      data: populateInMemoryPlan(plan),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private
export const deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const plan = await Plan.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Plan deleted successfully',
      });
    }

    // In-memory fallback
    const index = inMemoryPlans.findIndex((p) => p._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    inMemoryPlans.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
