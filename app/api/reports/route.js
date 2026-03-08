import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ReportService from '@/lib/reports';

const reportService = new ReportService();

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const type = searchParams.get('type');
        const status = searchParams.get('status');

        const reports = await reportService.getReports({
            page,
            limit,
            type,
            status
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error('Reports fetch error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching reports' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, type, parameters, format = 'PDF' } = body;

        if (!name || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const report = await reportService.createReport({
            name,
            type,
            parameters: JSON.stringify(parameters),
            format,
            generatedBy: session.user.id
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error('Report creation error:', error);
        return NextResponse.json(
            { error: 'An error occurred while creating report' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const reportId = searchParams.get('id');

        if (!reportId) {
            return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
        }

        await reportService.deleteReport(reportId);

        return NextResponse.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Report deletion error:', error);
        return NextResponse.json(
            { error: 'An error occurred while deleting report' },
            { status: 500 }
        );
    }
}
