import mongoose from 'mongoose';
import { SplitCollection } from '../models/SplitCollection.js';
import { getInMemoryPersonById } from './personController.js';

// In-memory fallback dataset for seamless dev testing when MongoDB is offline
let inMemorySplitCollections = [
  {
    _id: 'split_sample_01',
    user: 'dev_user_demo_01',
    title: 'Client Hospitality & Project Dinner',
    totalAmount: 450.00,
    date: new Date(Date.now() - 3600000 * 24 * 3),
    participants: [
      {
        _id: 'part_sample_01',
        person: 'person_sample_01', // Acme Logistics
        shareAmount: 150.00,
        status: 'Paid',
      },
      {
        _id: 'part_sample_02',
        person: 'person_sample_02', // Global Office Supplies
        shareAmount: 150.00,
        status: 'Pending',
      },
      {
        _id: 'part_sample_03',
        person: 'person_sample_03', // Marcus Vance (Staff)
        shareAmount: 150.00,
        status: 'Pending',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 3),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3),
  },
  {
    _id: 'split_sample_02',
    user: 'dev_user_demo_01',
    title: 'Shared Commercial Fiber Internet & Utilities',
    totalAmount: 320.00,
    date: new Date(Date.now() - 3600000 * 24 * 7),
    participants: [
      {
        _id: 'part_sample_04',
        person: 'person_sample_01',
        shareAmount: 160.00,
        status: 'Paid',
      },
      {
        _id: 'part_sample_05',
        person: 'person_sample_02',
        shareAmount: 160.00,
        status: 'Paid',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 7),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 7),
  },
];

// Helper to populate in-memory participants' person details
const populateInMemorySplitCollection = (collection) => {
  const populatedParticipants = (collection.participants || []).map((p) => {
    let personObj = null;
    const personId = typeof p.person === 'object' && p.person ? p.person._id : p.person;
    if (personId) {
      const found = getInMemoryPersonById(personId);
      if (found) {
        personObj = {
          _id: found._id,
          name: found.name,
          mobile: found.mobile,
          type: found.type,
          address: found.address,
        };
      }
    }
    return {
      _id: p._id,
      person: personObj || p.person,
      shareAmount: Number(p.shareAmount),
      status: p.status || 'Pending',
    };
  });

  return {
    ...collection,
    totalAmount: Number(collection.totalAmount),
    participants: populatedParticipants,
  };
};

// @desc    Get all split collections
// @route   GET /api/split-collections
// @access  Private
export const getSplitCollections = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    // Use MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const collections = await SplitCollection.find({ user: req.user._id })
        .populate('participants.person', 'name mobile type address')
        .sort({ date: -1, createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: collections.length,
        data: collections,
      });
    }

    // In-memory fallback
    const filtered = inMemorySplitCollections.filter(
      (c) => c.user === userId || c.user === 'dev_user_demo_01'
    );

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    const populated = filtered.map(populateInMemorySplitCollection);

    return res.status(200).json({
      success: true,
      count: populated.length,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single split collection by ID
// @route   GET /api/split-collections/:id
// @access  Private
export const getSplitCollectionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const collection = await SplitCollection.findOne({
        _id: id,
        user: req.user._id,
      }).populate('participants.person', 'name mobile type address');

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Split collection not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: collection,
      });
    }

    // In-memory fallback
    const collection = inMemorySplitCollections.find((c) => c._id === id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Split collection not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: populateInMemorySplitCollection(collection),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new split collection
// @route   POST /api/split-collections
// @access  Private
export const createSplitCollection = async (req, res, next) => {
  try {
    const { title, totalAmount, date, participants } = req.body;

    const numericTotal = Number(totalAmount);
    if (isNaN(numericTotal) || numericTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid total amount greater than 0',
      });
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one participant with a share amount',
      });
    }

    // Validate participants
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.person) {
        return res.status(400).json({
          success: false,
          message: `Participant #${i + 1} must have a valid person selected`,
        });
      }
      const share = Number(p.shareAmount);
      if (isNaN(share) || share < 0) {
        return res.status(400).json({
          success: false,
          message: `Participant #${i + 1} must have a valid share amount (>= 0)`,
        });
      }
    }

    const collectionDate = date ? new Date(date) : new Date();
    if (isNaN(collectionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date',
      });
    }

    const cleanTitle = title && title.trim() ? title.trim() : 'Split Collection';

    // Format participants payload
    const formattedParticipants = participants.map((p) => ({
      person: typeof p.person === 'object' && p.person ? p.person._id : p.person,
      shareAmount: Number(p.shareAmount),
      status: p.status === 'Paid' ? 'Paid' : 'Pending',
    }));

    if (mongoose.connection.readyState === 1) {
      const newCollection = await SplitCollection.create({
        user: req.user._id,
        title: cleanTitle,
        totalAmount: numericTotal,
        date: collectionDate,
        participants: formattedParticipants,
      });

      const populated = await SplitCollection.findById(newCollection._id).populate(
        'participants.person',
        'name mobile type address'
      );

      return res.status(201).json({
        success: true,
        message: 'Split collection created successfully',
        data: populated,
      });
    }

    // In-memory fallback
    const newCollection = {
      _id: `split_${Date.now()}`,
      user: req.user._id.toString(),
      title: cleanTitle,
      totalAmount: numericTotal,
      date: collectionDate,
      participants: formattedParticipants.map((p, idx) => ({
        _id: `part_${Date.now()}_${idx}`,
        ...p,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemorySplitCollections.unshift(newCollection);

    return res.status(201).json({
      success: true,
      message: 'Split collection created successfully',
      data: populateInMemorySplitCollection(newCollection),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a participant's status (e.g. to Paid)
// @route   PUT /api/split-collections/:id/participants/:participantId/status
// @access  Private
export const updateParticipantStatus = async (req, res, next) => {
  try {
    const { id, participantId } = req.params;
    const { status } = req.body;

    const targetStatus = status && ['Paid', 'Pending'].includes(status) ? status : 'Paid';

    if (mongoose.connection.readyState === 1) {
      const collection = await SplitCollection.findOne({
        _id: id,
        user: req.user._id,
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Split collection not found',
        });
      }

      // Match either participant subdoc _id or person _id
      const participant = collection.participants.find(
        (p) =>
          p._id.toString() === participantId ||
          (p.person && p.person.toString() === participantId)
      );

      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'Participant not found in this split collection',
        });
      }

      participant.status = targetStatus;
      await collection.save();

      const populated = await SplitCollection.findById(collection._id).populate(
        'participants.person',
        'name mobile type address'
      );

      return res.status(200).json({
        success: true,
        message: `Participant marked as ${targetStatus}`,
        data: populated,
      });
    }

    // In-memory fallback
    const collection = inMemorySplitCollections.find((c) => c._id === id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Split collection not found',
      });
    }

    const participant = collection.participants.find(
      (p) =>
        p._id === participantId ||
        p.person === participantId ||
        (typeof p.person === 'object' && p.person._id === participantId)
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found in this split collection',
      });
    }

    participant.status = targetStatus;
    collection.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: `Participant marked as ${targetStatus}`,
      data: populateInMemorySplitCollection(collection),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a split collection
// @route   DELETE /api/split-collections/:id
// @access  Private
export const deleteSplitCollection = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const collection = await SplitCollection.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Split collection not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Split collection deleted successfully',
      });
    }

    // In-memory fallback
    const index = inMemorySplitCollections.findIndex((c) => c._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Split collection not found',
      });
    }

    inMemorySplitCollections.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Split collection deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
