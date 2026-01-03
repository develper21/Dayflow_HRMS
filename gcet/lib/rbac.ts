import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface Permission {
  resource: string;
  action: string;
}

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  admin: [
    { resource: 'attendance', action: 'view_all' },
    { resource: 'attendance', action: 'approve' },
    { resource: 'attendance', action: 'edit' },
    { resource: 'attendance', action: 'export' },
    { resource: 'leave', action: 'view_all' },
    { resource: 'leave', action: 'approve' },
    { resource: 'leave', action: 'reject' },
    { resource: 'leave', action: 'export' },
    { resource: 'payroll', action: 'view_all' },
    { resource: 'payroll', action: 'edit' },
    { resource: 'payroll', action: 'export' },
    { resource: 'employees', action: 'view_all' },
    { resource: 'employees', action: 'create' },
    { resource: 'employees', action: 'edit' },
    { resource: 'employees', action: 'delete' },
    { resource: 'documents', action: 'view_all' },
    { resource: 'documents', action: 'upload' },
    { resource: 'documents', action: 'delete' },
  ],
  hr: [
    { resource: 'attendance', action: 'view_all' },
    { resource: 'attendance', action: 'approve' },
    { resource: 'attendance', action: 'export' },
    { resource: 'leave', action: 'view_all' },
    { resource: 'leave', action: 'approve' },
    { resource: 'leave', action: 'reject' },
    { resource: 'leave', action: 'export' },
    { resource: 'payroll', action: 'view_all' },
    { resource: 'payroll', action: 'export' },
    { resource: 'employees', action: 'view_all' },
    { resource: 'employees', action: 'edit' },
    { resource: 'documents', action: 'view_all' },
    { resource: 'documents', action: 'upload' },
  ],
  employee: [
    { resource: 'attendance', action: 'view_own' },
    { resource: 'attendance', action: 'check_in' },
    { resource: 'attendance', action: 'check_out' },
    { resource: 'leave', action: 'apply' },
    { resource: 'leave', action: 'view_own' },
    { resource: 'payroll', action: 'view_own' },
    { resource: 'documents', action: 'view_own' },
    { resource: 'documents', action: 'upload' },
  ],
};

export async function authenticateRequest(request: NextRequest): Promise<{
  user?: AuthenticatedUser;
  error?: string;
  status?: number;
}> {
  try {
    const token = await getAuthCookie();
    
    if (!token) {
      return { error: 'No authentication token found', status: 401 };
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return { error: 'Invalid token', status: 401 };
    }

    const [user] = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      firstName: users.first_name,
      lastName: users.last_name,
    }).from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!user) {
      return { error: 'User not found', status: 404 };
    }

    return { user };
  } catch (error) {
    return { error: 'Authentication failed', status: 500 };
  }
}

export function hasPermission(user: AuthenticatedUser, resource: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
  return permissions.some(p => p.resource === resource && p.action === action);
}

export function requirePermission(resource: string, action: string) {
  return (user: AuthenticatedUser): { error?: string; status?: number } => {
    if (!hasPermission(user, resource, action)) {
      return { error: 'Insufficient permissions', status: 403 };
    }
    return {};
  };
}

export function requireRole(allowedRoles: string[]) {
  return (user: AuthenticatedUser): { error?: string; status?: number } => {
    if (!allowedRoles.includes(user.role)) {
      return { error: 'Insufficient permissions', status: 403 };
    }
    return {};
  };
}

export const requireHR = requireRole(['hr', 'admin']);
export const requireAdmin = requireRole(['admin']);
export const requireEmployee = requireRole(['employee', 'hr', 'admin']);

// Permission helpers for common operations
export const canViewAllAttendance = (user: AuthenticatedUser) => hasPermission(user, 'attendance', 'view_all');
export const canApproveAttendance = (user: AuthenticatedUser) => hasPermission(user, 'attendance', 'approve');
export const canViewOwnAttendance = (user: AuthenticatedUser) => hasPermission(user, 'attendance', 'view_own');
export const canViewAllLeave = (user: AuthenticatedUser) => hasPermission(user, 'leave', 'view_all');
export const canApproveLeave = (user: AuthenticatedUser) => hasPermission(user, 'leave', 'approve');
export const canViewAllPayroll = (user: AuthenticatedUser) => hasPermission(user, 'payroll', 'view_all');
export const canViewAllEmployees = (user: AuthenticatedUser) => hasPermission(user, 'employees', 'view_all');
