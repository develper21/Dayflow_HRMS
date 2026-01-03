import { db } from '@/lib/db';
import { notifications, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function createLeaveNotification(userId: string, leaveId: string, status: 'applied' | 'approved' | 'rejected') {
  const hrUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, 'hr'));

  const notificationData = hrUsers.map(hr => ({
    user_id: hr.id,
    title: `Leave ${status}`,
    message: `Employee leave request has been ${status}`,
    type: 'leave_status' as const,
    created_at: new Date(),
    is_read: false,
  }));

  if (notificationData.length > 0) {
    await db.insert(notifications).values(notificationData);
  }
}

export async function createPayrollNotification(userId: string, payrollId: string) {
  const notification = {
    user_id: userId,
    title: 'Payroll Published',
    message: 'Your payroll has been published and is now available',
    type: 'payroll_published' as const,
    created_at: new Date(),
    is_read: false,
  };

  await db.insert(notifications).values(notification);

  // Return toast notification data
  return {
    userId,
    title: 'Payroll Published',
    message: 'Your payroll has been published and is now available for viewing.',
    type: 'success'
  };
}

export async function createApprovalNotification(userId: string, entityType: string, action: string) {
  const hrUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, 'hr'));

  const notificationData = hrUsers.map(hr => ({
    user_id: hr.id,
    title: `${entityType} Approval Required`,
    message: `A new ${entityType} requires your approval`,
    type: 'approval_request' as const,
    created_at: new Date(),
    is_read: false,
  }));

  if (notificationData.length > 0) {
    await db.insert(notifications).values(notificationData);
  }
}
