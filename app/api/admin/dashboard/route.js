import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const companyId = session.user.companyId;

        if (!companyId) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 400 }
            );
        }

        // Get total employees count
        const totalEmployees = await prisma.user.count({
            where: {
                companyId: companyId,
                role: 'EMPLOYEE',
            },
        });

        // Get recent employees (last 5)
        const recentEmployees = await prisma.user.findMany({
            where: {
                companyId: companyId,
                role: 'EMPLOYEE',
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 5,
            select: {
                id: true,
                name: true,
                email: true,
                employeeId: true,
                createdAt: true,
            },
        });

        // Get attendance stats for today (00:00:00 to 23:59:59)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const presentToday = await prisma.attendance.count({
            where: {
                user: { companyId: companyId },
                date: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
                checkIn: { not: null },
            },
        });

        const onLeave = await prisma.leaveRequest.count({
            where: {
                user: { companyId: companyId },
                startDate: { lte: endOfToday },
                endDate: { gte: startOfToday },
                status: 'APPROVED',
            },
        });

        const pendingLeaves = await prisma.leaveRequest.count({
            where: {
                user: { companyId: companyId },
                status: 'PENDING',
            },
        });

        const absentCount = totalEmployees - presentToday - onLeave;

        return NextResponse.json({
            stats: {
                totalEmployees,
                presentToday,
                onLeave,
                pendingLeaves,
                absentToday: absentCount > 0 ? absentCount : 0,
            },
            recentEmployees,
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching dashboard data' },
            { status: 500 }
        );
    }
}

