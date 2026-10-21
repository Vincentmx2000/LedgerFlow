import mongoose from 'mongoose';

const personSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please enter full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      minlength: [2, 'Role must be at least 2 characters'],
      maxlength: [30, 'Role cannot exceed 30 characters'],
      default: 'Customer',
    },
    type: {
      type: String,
      trim: true,
      minlength: [2, 'Type must be at least 2 characters'],
      maxlength: [30, 'Type cannot exceed 30 characters'],
      default: 'Customer',
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required and must be exactly 10 digits'],
      trim: true,
      validate: {
        validator: function (v) {
          const digitsOnly = (v || '').replace(/\D/g, '');
          return digitsOnly.length === 10;
        },
        message: (props) => `${props.value} is not a valid 10-digit phone number`,
      },
    },
    mobile: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v || v.trim() === '') return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
        },
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    group: {
      type: String,
      enum: {
        values: ['No Group', 'Family', 'Friends', 'Clients', 'Vendors', 'Staff', 'Consultants'],
        message: '{VALUE} is not a valid group',
      },
      default: 'No Group',
    },
    address: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize role/type and phone/mobile before validation
personSchema.pre('validate', function (next) {
  if (this.role && !this.type) this.type = this.role;
  if (this.type && !this.role) this.role = this.type;
  if (this.phone && !this.mobile) this.mobile = this.phone;
  if (this.mobile && !this.phone) this.phone = this.mobile;
  next();
});

// Index for efficient search and filtering per user
personSchema.index({ user: 1, role: 1, type: 1, group: 1, name: 1 });

export const Person = mongoose.model('Person', personSchema);
