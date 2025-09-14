import { User } from '../models/index.js';
import { asyncHandler, AppError, generateToken } from '../middleware/index.js';
import { body, validationResult } from 'express-validator';

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new AppError('Account temporarily locked due to multiple failed login attempts', 423);
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  
  if (!isPasswordMatch) {
    // Increment login attempts
    await user.incLoginAttempts();
    throw new AppError('Invalid credentials', 401);
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    data: {
      user,
      token
    },
    message: 'Login successful'
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, bio } = req.body;

  const user = await User.findById(req.user._id);

  if (firstName) user.profile.firstName = firstName;
  if (lastName) user.profile.lastName = lastName;
  if (bio !== undefined) user.profile.bio = bio;

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
    message: 'Profile updated successfully'
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isCurrentPasswordMatch = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// @desc    Admin login with email and password
// @route   POST /api/auth/admin-login
// @access  Public
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Check if user exists and is an admin
  const user = await User.findOne({ 
    email,
    role: { $in: ['admin', 'moderator'] },
    isActive: true
  }).select('+password');
  
  if (!user) {
    throw new AppError('Invalid admin credentials', 401);
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new AppError('Account temporarily locked due to multiple failed login attempts', 423);
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  
  if (!isPasswordMatch) {
    // Increment login attempts
    await user.incLoginAttempts();
    throw new AppError('Invalid admin credentials', 401);
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    data: {
      user,
      token
    },
    message: 'Admin login successful'
  });
});

// @desc    Verify admin token
// @route   GET /api/auth/verify-admin
// @access  Private
export const verifyAdmin = asyncHandler(async (req, res) => {
  // This endpoint is just to verify the admin token is valid
  // The actual verification is done in the auth middleware
  
  res.status(200).json({
    success: true,
    data: {
      role: 'admin',
      verified: true
    },
    message: 'Admin token is valid'
  });
});

// Validation rules for authentication
export const loginValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ];
};

export const changePasswordValidationRules = () => {
  return [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
  ];
};

export const adminLoginValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ];
};

// Handle validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};