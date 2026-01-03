import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { authenticateRequest, requireEmployee } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }
    const roleCheck = requireEmployee(auth.user);
    if (roleCheck.error) {
      return NextResponse.json({ error: roleCheck.error }, { status: roleCheck.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = db.select({
      id: attendance.id,
      date: attendance.date,
      checkIn: attendance.check_in,
      checkOut: attendance.check_out,
      status: attendance.status,
      notes: attendance.notes,
    }).from(attendance).where(eq(attendance.user_id, auth.user.id));

    if (from && to) {
      query = db.select({
        id: attendance.id,
        date: attendance.date,
        checkIn: attendance.check_in,
        checkOut: attendance.check_out,
        status: attendance.status,
        notes: attendance.notes,
      }).from(attendance).where(and(
        eq(attendance.user_id, auth.user.id),
        gte(attendance.date, from),
        lte(attendance.date, to)
      ));
    }

    const records = await query.orderBy(attendance.date);

    const attendanceRecords = records.map((record: any) => {
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
      };
    });

    return NextResponse.json(attendanceRecords);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
