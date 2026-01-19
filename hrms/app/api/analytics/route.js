import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AnalyticsService from '@/lib/analytics';

const analyticsService = new AnalyticsService();

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'dashboard';
        const userId = session.user.role === 'EMPLOYEE' ? session.user.id : searchParams.get('userId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const period = searchParams.get('period') || 'monthly';

        let data;

        switch (type) {
            case 'dashboard':
                data = await analyticsService.getDashboardAnalytics(userId);
                break;
            case 'attendance':
                data = await analyticsService.getAttendanceAnalytics(userId, startDate, endDate);
                break;
            case 'payroll':
                const month = parseInt(searchParams.get('month'));
                const year = parseInt(searchParams.get('year'));
                data = await analyticsService.getPayrollAnalytics(userId, month, year);
                break;
            case 'leave':
                data = await analyticsService.getLeaveAnalytics(userId, startDate, endDate);
                break;
            case 'employees':
                if (session.user.role !== 'ADMIN') {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }
                data = await analyticsService.getEmployeeAnalytics();
                break;
            case 'performance':
                if (session.user.role !== 'ADMIN') {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }
                data = await analyticsService.getPerformanceAnalytics();
                break;
            case 'training':
                if (session.user.role !== 'ADMIN') {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }
                data = await analyticsService.getTrainingAnalytics();
                break;
            case 'recruitment':
                if (session.user.role !== 'ADMIN') {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }
                data = await analyticsService.getRecruitmentAnalytics();
                break;
            case 'trends':
                data = await analyticsService.getTrendAnalytics(
                    searchParams.get('trendType') || 'attendance',
                    period
                );
                break;
            default:
                return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching analytics' },
            { status: 500 }
        );
    }
}
