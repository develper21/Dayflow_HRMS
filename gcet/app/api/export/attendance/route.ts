import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance, users } from '@/lib/db/schema';
import { eq, and, between, desc, gte, lte } from 'drizzle-orm';
import { authenticateRequest, requireEmployee, requireHR } from '@/lib/rbac';
import { generateAttendanceCSV, downloadCSV, formatDateForExport, calculateWorkHours as calculateWorkHoursCSV, AttendanceExportRecord } from '@/lib/csvUtils';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    // Build query conditions
    const conditions = [];
    
    if (userId && requireHR(auth.user).error === undefined) {
      conditions.push(eq(attendance.user_id, userId));
    } else {
      // employees can only export their own
      conditions.push(eq(attendance.user_id, auth.user.id));
    }

    if (startDate && endDate) {
      conditions.push(between(attendance.date, startDate, endDate));
    }

    if (status) {
      conditions.push(eq(attendance.status, status as any));
    }

    // Fetch attendance data
    const attendanceData = await db
      .select({
        employeeId: users.employee_id,
        employeeName: users.first_name,
        date: attendance.date,
        checkIn: attendance.check_in,
        checkOut: attendance.check_out,
        status: attendance.status,
        notes: attendance.notes,
      })
      .from(attendance)
      .leftJoin(users, eq(attendance.user_id, users.id))
      .where(and(...conditions))
      .orderBy(desc(attendance.date));

    // Transform data for CSV export
    const exportData: AttendanceExportRecord[] = attendanceData.map((record): AttendanceExportRecord => {
      const checkInIso = record.checkIn ? new Date(record.checkIn).toISOString() : null;
      const checkOutIso = record.checkOut ? new Date(record.checkOut).toISOString() : null;

      return {
        employeeId: record.employeeId || 'N/A',
        employeeName: record.employeeName || 'Unknown',
        date: formatDateForExport(record.date),
        checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '',
        checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '',
        status: record.status,
        notes: record.notes,
        workHours: calculateWorkHoursCSV(checkInIso, checkOutIso),
      };
    });

    // Generate CSV
    const csvContent = generateAttendanceCSV(exportData);
    const filename = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;

    // Return CSV as response
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Attendance export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
