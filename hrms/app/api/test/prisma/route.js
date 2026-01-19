import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        // Test Prisma connection
        await prisma.$connect();

        // Get counts
        const userCount = await prisma.user.count();
        const companyCount = await prisma.company.count();
        const profileCount = await prisma.employeeProfile.count();

        // Get sample data
        const users = await prisma.user.findMany({
            take: 5,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                employeeId: true,
                companyId: true,
            },
        });

        const companies = await prisma.company.findMany({
            take: 5,
            select: {
                id: true,
                name: true,
                logo: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Prisma is working correctly!',
            stats: {
                users: userCount,
                companies: companyCount,
                profiles: profileCount,
            },
            sampleData: {
                users,
                companies,
            },
        });
    } catch (error) {
        console.error('Prisma test error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                details: error.toString(),
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

