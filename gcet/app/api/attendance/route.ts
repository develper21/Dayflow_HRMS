import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance, users } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { authenticateRequest, requireHR } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }
    const roleCheck = requireHR(auth.user);
    if (roleCheck.error) {
      return NextResponse.json({ error: roleCheck.error }, { status: roleCheck.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const userId = searchParams.get('userId');

    // Build where conditions
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(attendance.user_id, userId));
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

    const records = await query.orderBy(attendance.date);

    interface AttendanceQueryRecord {
  id: string;
  date: string;
  checkIn: Date | null;
  checkOut: Date | null;
  status: string;
  notes: string | null;
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
