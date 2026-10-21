import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'Please select a participant from people'],
    },
    shareAmount: {
      type: Number,
      required: [true, 'Please specify participant share amount'],
      min: [0, 'Share amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['Paid', 'Pending'],
        message: '{VALUE} is not a valid status. Allowed values: Paid, Pending',
      },
      default: 'Pending',
      required: true,
    },
  },
  {
    _id: true,
  }
);

const splitCollectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Split Collection',
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Please provide total amount for split collection'],
      min: [0.01, 'Total amount must be greater than 0'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide collection date'],
      default: Date.now,
    },
    participants: {
      type: [participantSchema],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'A split collection must have at least one participant',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance
splitCollectionSchema.index({ user: 1, date: -1 });

export const SplitCollection = mongoose.model('SplitCollection', splitCollectionSchema);
