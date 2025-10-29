import { Request, Response } from 'express';
import User from '../models/user.model';
import Tenant from '../models/tenant.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/email.util';
import { AppError } from '../middlewares/error.middleware';

// Generate OTP
const generateOTP = (): string => {
  const length = parseInt(process.env.OTP_LENGTH || '6');
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
};

// Register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    let { tenantId, email, password, firstName, lastName, role } = req.body;

    // Use default tenant from environment if not provided
    if (!tenantId) {
      tenantId = process.env.DEFAULT_TENANT || 'default';
    }

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Email, password, firstName, and lastName are required', 400);
    }

    // Check if tenant exists, create if not found for default tenant
    let tenant = await Tenant.findOne({ name: tenantId });
    if (!tenant && tenantId === (process.env.DEFAULT_TENANT || 'default')) {
      // Create default tenant if it doesn't exist
      tenant = await Tenant.create({
        name: tenantId,
        domain: 'default.local',
        isActive: true,
        subscription: {
          plan: 'basic',
          maxUsers: 1000,
        },
        contactInfo: {
          email: 'admin@default.local',
        },
      });
    } else if (!tenant) {
      throw new AppError('Invalid tenant', 400);
    }
    
    if (!tenant.isActive) {
      throw new AppError('Tenant is inactive', 400);
    }

    // Check user limit for tenant
    const userCount = await User.countDocuments({ tenantId: tenant._id });
    if (userCount >= tenant.subscription.maxUsers) {
      throw new AppError('User limit reached for this tenant', 403);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ tenantId: tenant._id, email });
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    // Create user
    const user = await User.create({
      tenantId: tenant._id,
      email,
      password,
      firstName,
      lastName,
      role: role || 'employee',
    });

    // Send welcome email (optional, can skip if email service not configured)
    try {
      await sendWelcomeEmail(email, firstName, tenant.name);
    } catch (emailError) {
      console.log('Warning: Could not send welcome email:', emailError);
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Registration failed' });
    }
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    let { email, password, tenantId } = req.body;

    // Use default tenant from environment if not provided
    if (!tenantId) {
      tenantId = process.env.DEFAULT_TENANT || 'default';
    }

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find tenant first
    const tenant = await Tenant.findOne({ name: tenantId });
    if (!tenant) {
      throw new AppError('Invalid tenant', 400);
    }

    // Find user with password
    const user = await User.findOne({ email, tenantId: tenant._id }).select('+password');

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is inactive', 403);
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens with role
    const accessToken = generateAccessToken(user._id.toString(), tenant._id.toString(), user.role, user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), tenant._id.toString(), user.role);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        tenantId: user.tenantId,
      },
      tenant: {
        id: tenant?._id,
        name: tenant?.name,
        logo: tenant?.logo,
        primaryColor: tenant?.primaryColor,
        secondaryColor: tenant?.secondaryColor,
        accentColor: tenant?.accentColor,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Login failed' });
    }
  }
};

// Refresh Token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new tokens with role
    const newAccessToken = generateAccessToken(user._id.toString(), decoded.tenantId, user.role, user.email);
    const newRefreshToken = generateRefreshToken(user._id.toString(), decoded.tenantId, user.role);

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(401).json({ message: 'Token refresh failed' });
    }
  }
};

// Forgot Password (Send OTP)
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, tenantId } = req.body;

    if (!email || !tenantId) {
      throw new AppError('Email and tenant ID are required', 400);
    }

    // Find user
    const user = await User.findOne({ email, tenantId });

    if (!user) {
      // Don't reveal if user exists or not
      res.json({ message: 'If the email exists, an OTP has been sent' });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN || '600000'));

    // Save OTP
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, user.firstName);

    res.json({ message: 'If the email exists, an OTP has been sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, tenantId, otp } = req.body;

    if (!email || !tenantId || !otp) {
      throw new AppError('Email, tenant ID, and OTP are required', 400);
    }

    // Find user with OTP
    const user = await User.findOne({ email, tenantId }).select('+otp +otpExpires');

    if (!user || !user.otp || !user.otpExpires) {
      throw new AppError('Invalid OTP', 400);
    }

    // Check if OTP is expired
    if (user.otpExpires < new Date()) {
      throw new AppError('OTP has expired', 400);
    }

    // Verify OTP
    if (user.otp !== otp) {
      throw new AppError('Invalid OTP', 400);
    }

    // Generate reset token
    const resetToken = generateAccessToken(user._id.toString(), tenantId);

    res.json({
      message: 'OTP verified successfully',
      resetToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'OTP verification failed' });
    }
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, tenantId, newPassword, resetToken } = req.body;

    if (!email || !tenantId || !newPassword || !resetToken) {
      throw new AppError('All fields are required', 400);
    }

    // Find user
    const user = await User.findOne({ email, tenantId }).select('+otp +otpExpires');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Password reset failed' });
    }
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user) {
      // Find user and clear refresh token
      const user = await User.findById(req.user.userId);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    // Clear session
    req.session.destroy(() => {});

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
};

// Get Current User
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Fetch full user details
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const tenant = await Tenant.findById(req.user.tenantId);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        tenantId: user.tenantId,
      },
      tenant: {
        id: tenant?._id,
        name: tenant?.name,
        logo: tenant?.logo,
        primaryColor: tenant?.primaryColor,
        secondaryColor: tenant?.secondaryColor,
        accentColor: tenant?.accentColor,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user info' });
  }
};
