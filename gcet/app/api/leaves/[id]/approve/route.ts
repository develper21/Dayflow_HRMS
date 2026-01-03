import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leaves, users, notifications, attendance } from '@/lib/db/schema';
import { authenticateRequest, requireHR } from '@/lib/rbac';
import { eq, and, between } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest(request);
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const roleCheck = requireHR(auth.user!);
    if (roleCheck.error) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: roleCheck.status }
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

    // Check for attendance conflicts during leave period
    const attendanceConflicts = await db.select()
      .from(attendance)
      .where(
        and(
          eq(attendance.user_id, leave.user_id),
          between(attendance.date, leave.start_date, leave.end_date),
          eq(attendance.status, 'present')
        )
      )
      .limit(1);

    // If there are attendance conflicts, mark them as leave
    if (attendanceConflicts.length > 0) {
      await db.update(attendance)
        .set({
          status: 'leave',
          notes: `Status updated due to approved leave from ${leave.start_date} to ${leave.end_date}`,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(attendance.user_id, leave.user_id),
            between(attendance.date, leave.start_date, leave.end_date)
          )
        );
    }

    // Update leave status
    const [updatedLeave] = await db.update(leaves)
      .set({
        status: 'approved',
        approver_id: auth.user!.id,
        approver_comments,
        updated_at: new Date(),
      })
      .where(eq(leaves.id, id))
      .returning();

    // Create notification for employee
    let notificationMessage = `Your leave from ${leave.start_date} to ${leave.end_date} has been approved by ${auth.user!.firstName} ${auth.user!.lastName}.`;
    
    if (attendanceConflicts.length > 0) {
      notificationMessage += ` ${attendanceConflicts.length} attendance record(s) updated to leave status.`;
    }
    
    await db.insert(notifications).values({
      user_id: leave.user_id,
      type: 'leave_status',
      title: 'Leave Approved',
      message: notificationMessage,
      link: '/leave',
      payload: {
        leaveId: leave.id,
        action: 'approved',
        approver: `${auth.user!.firstName} ${auth.user!.lastName}`,
        attendanceUpdated: attendanceConflicts.length > 0,
        employeeName: `${employee?.firstName} ${employee?.lastName}`,
        employeeId: employee?.employeeId,
      },
      created_at: new Date(),
    });

    // Return notification data for toast
    const notificationData = {
      userId: leave.user_id,
      title: 'Leave Approved',
      message: attendanceConflicts.length > 0 
        ? `Your leave has been approved. ${attendanceConflicts.length} attendance record(s) updated to leave status.`
        : `Your leave from ${leave.start_date} to ${leave.end_date} has been approved.`,
      type: 'success'
    };

    return NextResponse.json({
      message: 'Leave approved successfully',
      leave: updatedLeave,
      employee: {
        name: `${employee?.firstName} ${employee?.lastName}`,
        employeeId: employee?.employeeId,
        email: employee?.email,
      },
      attendanceUpdated: attendanceConflicts.length > 0,
      attendanceRecordsUpdated: attendanceConflicts.length,
      toast: notificationData
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
