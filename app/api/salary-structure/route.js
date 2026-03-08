import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Employees can only see their own
        if (session.user.role !== 'ADMIN' && userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let salary = await prisma.salaryStructure.findUnique({
            where: { userId }
        });

        if (!salary && session.user.role === 'ADMIN') {
            // Initialize empty structure for admin if it doesn't exist
            salary = await prisma.salaryStructure.create({
                data: { userId }
            });
        }

        return NextResponse.json({ salary });
    } catch (error) {
        console.error('Fetch salary error:', error);
        return NextResponse.json({ error: 'Failed to fetch salary structure' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, ...data } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Remove ID and timestamps if they exist in the incoming data
        delete data.id;
        delete data.createdAt;
        delete data.updatedAt;

        const updatedSalary = await prisma.salaryStructure.update({
            where: { userId },
            data
        });

        return NextResponse.json({ message: 'Salary structure updated', salary: updatedSalary });
    } catch (error) {
        console.error('Update salary error:', error);
        return NextResponse.json({ error: 'Failed to update salary structure' }, { status: 500 });
    }
}
