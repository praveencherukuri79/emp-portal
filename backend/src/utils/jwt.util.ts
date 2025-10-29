import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production';

export const generateAccessToken = (userId: string, tenantId: string, role?: string, email?: string): string => {
  try {
    return jwt.sign(
      { userId, tenantId, role: role || 'employee', email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  } catch (error) {
    throw new Error('Failed to generate access token');
  }
};

export const generateRefreshToken = (userId: string, tenantId: string, role?: string): string => {
  try {
    return jwt.sign(
      { userId, tenantId, role: role || 'employee' },
      JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );
  } catch (error) {
    throw new Error('Failed to generate refresh token');
  }
};

export const verifyRefreshToken = (token: string): { userId: string; tenantId: string } => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as {
      userId: string;
      tenantId: string;
    };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
