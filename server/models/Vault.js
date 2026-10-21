import mongoose from 'mongoose';

const vaultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide vault name'],
      trim: true,
      maxlength: [100, 'Vault name cannot exceed 100 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please provide target amount'],
      min: [0.01, 'Target amount must be greater than 0'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    currentAllocated: {
      type: Number,
      default: 0,
      min: [0, 'Allocated amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['In Progress', 'Target Met', 'Claimed'],
        message: '{VALUE} is not a valid status. Allowed: In Progress, Target Met, Claimed',
      },
      default: 'In Progress',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup by user and status
vaultSchema.index({ user: 1, status: 1, createdAt: -1 });

export const Vault = mongoose.model('Vault', vaultSchema);
