import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      enum: {
        values: ['Payment', 'Collection', 'Expense', 'Other'],
        message: '{VALUE} is not a valid activity type. Allowed: Payment, Collection, Expense, Other',
      },
      required: [true, 'Please specify activity type (Payment, Collection, Expense, Other)'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide planned amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Please specify scheduled date'],
      default: Date.now,
    },
    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['Upcoming', 'Completed'],
        message: '{VALUE} is not a valid status. Allowed: Upcoming, Completed',
      },
      default: 'Upcoming',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance
planSchema.index({ user: 1, status: 1, scheduledDate: 1 });

export const Plan = mongoose.model('Plan', planSchema);
