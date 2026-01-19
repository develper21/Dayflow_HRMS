import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// POST check in/out
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { action } = await request.json(); // 'checkin' or 'checkout'

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find today's attendance record
        let attendance = await prisma.attendance.findFirst({
            where: {
                userId: session.user.id,
                date: {
                    gte: today,
                },
            },
        });

        if (action === 'checkin') {
            if (attendance && attendance.checkIn) {
                return NextResponse.json(
                    { error: 'Already checked in today' },
                    { status: 400 }
                );
            }

            if (!attendance) {
                attendance = await prisma.attendance.create({
                    data: {
                        userId: session.user.id,
                        checkIn: new Date(),
                        status: 'PRESENT',
                    },
                });
            } else {
                attendance = await prisma.attendance.update({
                    where: { id: attendance.id },
                    data: {
                        checkIn: new Date(),
                        status: 'PRESENT',
                    },
                });
            }

            return NextResponse.json(
                {
                    message: 'Checked in successfully',
                    attendance,
                },
                { status: 200 }
            );
        } else if (action === 'checkout') {
            if (!attendance || !attendance.checkIn) {
                return NextResponse.json(
                    { error: 'Please check in first' },
                    { status: 400 }
                );
            }

            if (attendance.checkOut) {
                return NextResponse.json(
                    { error: 'Already checked out today' },
                    { status: 400 }
                );
            }

            attendance = await prisma.attendance.update({
                where: { id: attendance.id },
                data: {
                    checkOut: new Date(),
                },
            });

            return NextResponse.json(
                {
                    message: 'Checked out successfully',
                    attendance,
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Attendance error:', error);
        return NextResponse.json(
            { error: 'Failed to process attendance' },
            { status: 500 }
        );
    }
}

// GET attendance records
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const statusOnly = searchParams.get('statusOnly') === 'true';
        const dateStr = searchParams.get('date'); // YYYY-MM-DD
        const search = searchParams.get('search');

        // Admin can view all, Employees only their own
        if (session.user.role !== 'ADMIN' && userId && userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const effectiveUserId = userId || (session.user.role === 'ADMIN' ? null : session.user.id);

        if (statusOnly) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const attendance = await prisma.attendance.findFirst({
                where: {
                    userId: session.user.id,
                    date: {
                        gte: today,
                    },
                },
            });

            return NextResponse.json({
                checkedIn: !!(attendance && attendance.checkIn && !attendance.checkOut),
                checkedOut: !!(attendance && attendance.checkOut),
                attendance
            }, { status: 200 });
        }

        let where = {};
        if (effectiveUserId) {
            where.userId = effectiveUserId;
        }

        if (dateStr) {
            const startDate = new Date(dateStr);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(dateStr);
            endDate.setHours(23, 59, 59, 999);
            where.date = {
                gte: startDate,
                lte: endDate,
            };
        }

        if (search && session.user.role === 'ADMIN') {
            where.user = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { employeeId: { contains: search, mode: 'insensitive' } },
                ]
            };
        }

        const attendance = await prisma.attendance.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        employeeId: true,
                    }
                }
            },
            orderBy: { date: 'desc' },
        });

        // Helper to formatting hours
        const formattedAttendance = attendance.map(record => {
            let workHours = 0;
            let extraHours = 0;

            if (record.checkIn && record.checkOut) {
                const diff = (new Date(record.checkOut) - new Date(record.checkIn)) / (1000 * 60 * 60);
                workHours = Math.floor(diff * 100) / 100;
                if (workHours > 8) {
                    extraHours = Math.floor((workHours - 8) * 100) / 100;
                }
            }

            return {
                ...record,
                workHours: workHours.toFixed(1),
                extraHours: extraHours.toFixed(1)
            };
        });

        return NextResponse.json({ attendance: formattedAttendance }, { status: 200 });
    } catch (error) {
        console.error('Get attendance error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendance' },
            { status: 500 }
        );
    }
}


