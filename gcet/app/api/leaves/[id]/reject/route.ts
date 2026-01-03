import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leaves, users, notifications, attendance } from '@/lib/db/schema';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { eq, and, between } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getAuthCookie();
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const [currentUser] = await db.select({
      role: users.role,
      firstName: users.first_name,
      lastName: users.last_name,
    }).from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { approver_comments } = await request.json();

    const [leave] = await db.select()
      .from(leaves)
      .where(eq(leaves.id, id))
      .limit(1);

    if (!leave) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    if (leave.status !== 'pending') {
      return NextResponse.json(
        { error: 'Leave request already processed' },
        { status: 400 }
      );
    }

    // Fetch employee details for notification
    const [employee] = await db.select({
      firstName: users.first_name,
      lastName: users.last_name,
      email: users.email,
      employeeId: users.employee_id,
    }).from(users).where(eq(users.id, leave.user_id)).limit(1);

    // Check for attendance records during leave period (for notification)
    const attendanceRecords = await db.select()
      .from(attendance)
      .where(
        and(
          eq(attendance.user_id, leave.user_id),
          between(attendance.date, leave.start_date, leave.end_date)
        )
      )
      .limit(5);

    // Update leave status
    const [updatedLeave] = await db.update(leaves)
      .set({
        status: 'rejected',
        approver_id: payload.userId,
        approver_comments,
        updated_at: new Date(),
      })
      .where(eq(leaves.id, id))
      .returning();

    // Create notification for employee
    let notificationMessage = `Your leave from ${leave.start_date} to ${leave.end_date} has been rejected by ${currentUser.firstName} ${currentUser.lastName}.`;
    
    if (attendanceRecords.length > 0) {
      notificationMessage += ` Found ${attendanceRecords.length} attendance record(s) during this period.`;
    }
    
    await db.insert(notifications).values({
      user_id: leave.user_id,
      type: 'leave_status',
      title: 'Leave Rejected',
      message: notificationMessage,
      link: '/leave',
      payload: {
        leaveId: leave.id,
        action: 'rejected',
        approver: `${currentUser.firstName} ${currentUser.lastName}`,
        attendanceRecordsFound: attendanceRecords.length > 0,
        employeeName: `${employee?.firstName} ${employee?.lastName}`,
        employeeId: employee?.employeeId,
      },
      created_at: new Date(),
    });

    // Return notification data for toast
    const notificationData = {
      userId: leave.user_id,
      title: 'Leave Rejected',
      message: `Your leave from ${leave.start_date} to ${leave.end_date} has been rejected.`,
      type: 'error'
    };

    return NextResponse.json({
      message: 'Leave rejected successfully',
      leave: updatedLeave,
      employee: {
        name: `${employee?.firstName} ${employee?.lastName}`,
        employeeId: employee?.employeeId,
        email: employee?.email,
      },
      attendanceRecordsFound: attendanceRecords.length,
      toast: notificationData
    });

  } catch (error) {
    console.error('Reject leave error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
