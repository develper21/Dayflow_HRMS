import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance, users } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { authenticateRequest, requirePermission, canViewAllAttendance, canViewOwnAttendance } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const userId = searchParams.get('userId');

    // Check permissions and set appropriate user filter
    let effectiveUserId = userId;
    
    if (canViewAllAttendance(auth.user)) {
      // HR/Admin can view all or specific employee
      effectiveUserId = userId;
    } else if (canViewOwnAttendance(auth.user)) {
      // Employee can only view their own
      effectiveUserId = auth.user.id;
      // Prevent employees from accessing other users' data
      if (userId && userId !== auth.user.id) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Build where conditions
    const conditions = [];
    
    if (effectiveUserId) {
      conditions.push(eq(attendance.user_id, effectiveUserId));
    }

    if (from && to) {
      conditions.push(gte(attendance.date, from));
      conditions.push(lte(attendance.date, to));
    }

    // Build the query with conditional where
    const queryBuilder = db.select({
      id: attendance.id,
      date: attendance.date,
      checkIn: attendance.check_in,
      checkOut: attendance.check_out,
      status: attendance.status,
      notes: attendance.notes,
      createdAt: attendance.created_at,
      updatedAt: attendance.updated_at,
      user: {
        id: users.id,
        firstName: users.first_name,
        lastName: users.last_name,
        email: users.email,
        employeeId: users.employee_id,
      },
    })
    .from(attendance)
    .leftJoin(users, eq(attendance.user_id, users.id));

    const query = conditions.length > 0 
      ? queryBuilder.where(and(...conditions))
      : queryBuilder;

    const records = await query.orderBy(desc(attendance.date));

    interface AttendanceQueryRecord {
      id: string;
      date: string;
      checkIn: Date | null;
      checkOut: Date | null;
      status: string;
      notes: string | null;
      createdAt: Date | null;
      updatedAt: Date | null;
      user?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        employeeId: string | null;
      } | null;
    }

    const attendanceRecords = records.map((record: AttendanceQueryRecord) => {
      let workHours = '00:00';
      let extraHours = '00:00';
      const checkInIso = record.checkIn ? new Date(record.checkIn).toISOString() : '';
      const checkOutIso = record.checkOut ? new Date(record.checkOut).toISOString() : '';

      if (record.checkIn && record.checkOut) {
        const checkIn = new Date(record.checkIn);
        const checkOut = new Date(record.checkOut);
        const diffMs = checkOut.getTime() - checkIn.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        workHours = `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
        
        const standardHours = 8;
        if (diffHours > standardHours) {
          const extraHoursNum = diffHours - standardHours;
          extraHours = `${extraHoursNum.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
        }
      }

      return {
        id: record.id,
        date: record.date,
        checkIn: checkInIso,
        checkOut: checkOutIso,
        workHours,
        extraHours,
        status: record.status,
        createdAt: record.createdAt?.toISOString() || null,
        updatedAt: record.updatedAt?.toISOString() || null,
        user: record.user,
      };
    });

    return NextResponse.json(attendanceRecords);

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    // Check if user can check in/out
    const permissionCheck = requirePermission('attendance', 'check_in')(auth.user);
    if (permissionCheck.error) {
      return NextResponse.json({ error: permissionCheck.error }, { status: permissionCheck.status || 403 });
    }

    const body = await request.json();
    const { date, checkIn, checkOut, notes } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Create attendance record
    const [newRecord] = await db.insert(attendance).values({
      user_id: auth.user.id,
      date,
      check_in: checkIn ? new Date(checkIn) : null,
      check_out: checkOut ? new Date(checkOut) : null,
      status: 'present', // Default status for now
      notes: notes || null,
    }).returning();

    return NextResponse.json(newRecord, { status: 201 });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    // Check if user can edit attendance (HR/Admin)
    const permissionCheck = requirePermission('attendance', 'edit')(auth.user);
    if (permissionCheck.error) {
      return NextResponse.json({ error: permissionCheck.error }, { status: permissionCheck.status || 403 });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData = {
      status: status || 'present',
      notes: notes || null,
      updated_at: new Date(),
    };

    const [updatedRecord] = await db
      .update(attendance)
      .set(updateData)
      .where(eq(attendance.id, id))
      .returning();

    if (!updatedRecord) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRecord);

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
