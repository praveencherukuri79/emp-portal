import { Request, Response, NextFunction } from 'express';
import Tenant from '../models/tenant.model';
import '../middlewares/auth.middleware'; // Import to ensure types are extended

export const tenantIsolation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get tenant ID from request header or from authenticated user
    let tenantId = req.headers['x-tenant-id'] as string;

    // If user is authenticated, use their tenantId
    if (req.user) {
      tenantId = req.user.tenantId.toString();
    }

    if (!tenantId) {
      res.status(400).json({ message: 'Tenant ID is required' });
      return;
    }

    // Verify tenant exists and is active
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      res.status(404).json({ message: 'Tenant not found' });
      return;
    }

    if (!tenant.isActive) {
      res.status(403).json({ message: 'Tenant is inactive' });
      return;
    }

    // Attach tenantId to request
    req.tenantId = tenantId;

    next();
  } catch (error) {
    res.status(500).json({ message: 'Tenant isolation error' });
  }
};

export const validateTenantAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || !req.tenantId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Ensure user belongs to the tenant
  if (req.user.tenantId.toString() !== req.tenantId) {
    res.status(403).json({ message: 'Access denied: User does not belong to this tenant' });
    return;
  }

  next();
};
