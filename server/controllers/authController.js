import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

// In-memory fallback user store when MongoDB is not connected
const inMemoryUsers = [
  {
    _id: 'dev_user_demo_01',
    name: 'Administrator',
    email: 'admin@ledgerflow.io',
    password: '', // will be hashed below
    currency: 'INR',
    createdAt: new Date(),
  },
];

// Pre-hash demo admin password
(async () => {
  const salt = await bcrypt.genSalt(10);
  inMemoryUsers[0].password = await bcrypt.hash('ledgerflow123', salt);
})();

export const getInMemoryUserById = (id) => {
  return inMemoryUsers.find((u) => u._id === id);
};

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'ledgerflow_super_secret_jwt_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, currency } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Use MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }

      const user = await User.create({
        name,
        email: cleanEmail,
        password,
        currency: currency || 'INR',
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          createdAt: user.createdAt,
        },
      });
    }

    // In-memory fallback
    const memoryUserExists = inMemoryUsers.find((u) => u.email === cleanEmail);
    if (memoryUserExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: `user_${Date.now()}`,
      name,
      email: cleanEmail,
      password: hashedPassword,
      currency: currency || 'INR',
      createdAt: new Date(),
    };

    inMemoryUsers.push(newUser);
    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully (Active session)',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        currency: newUser.currency,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Use MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User not found.',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Incorrect password.',
        });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          createdAt: user.createdAt,
        },
      });
    }

    // In-memory fallback
    const user = inMemoryUsers.find((u) => u.email === cleanEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        currency: req.user.currency,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, currency } = req.body;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (name) user.name = name;
      if (currency) user.currency = currency;

      const updatedUser = await user.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          currency: updatedUser.currency,
          createdAt: updatedUser.createdAt,
        },
      });
    }

    // In-memory fallback
    const memoryUser = inMemoryUsers.find((u) => u._id === req.user._id);
    if (!memoryUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) memoryUser.name = name;
    if (currency) memoryUser.currency = currency;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: memoryUser._id,
        name: memoryUser.name,
        email: memoryUser.email,
        currency: memoryUser.currency,
        createdAt: memoryUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
