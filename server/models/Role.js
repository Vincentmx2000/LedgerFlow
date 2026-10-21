import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      minlength: [2, 'Role name must be at least 2 characters'],
      maxlength: [30, 'Role name cannot exceed 30 characters'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index per user, case-insensitive
roleSchema.index(
  { user: 1, name: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 },
  }
);

export const Role = mongoose.model('Role', roleSchema);
