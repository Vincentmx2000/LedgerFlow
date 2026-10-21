import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: {
        values: ['Sale', 'Purchase', 'Payment', 'Receipt', 'Expense'],
        message: '{VALUE} is not a valid transaction type. Allowed: Sale, Purchase, Payment, Receipt, Expense',
      },
      required: [true, 'Please specify transaction type (Sale, Purchase, Payment, Receipt, Expense)'],
    },
    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide transaction amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide transaction date'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup by user, type, and date
transactionSchema.index({ user: 1, type: 1, date: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
