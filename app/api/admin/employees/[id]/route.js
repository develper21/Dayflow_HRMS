import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// GET single employee
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Await params for Next.js 15
        const { id } = await params;

        const employee = await prisma.user.findUnique({
            where: { id },
            include: {
                company: true,
                profile: true,
                jobDetails: true,
                salaryStructure: true,
                documents: true,
            },
        });

        if (!employee) {
            return NextResponse.json(
                { error: 'Employee not found' },
                { status: 404 }
            );
        }

        // Check authorization
        if (session.user.role !== 'ADMIN' && session.user.id !== employee.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json({ employee }, { status: 200 });
    } catch (error) {
        console.error('Get employee error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch employee' },
            { status: 500 }
        );
    }
}

// PUT update employee
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Await params for Next.js 15
        const { id } = await params;
        const body = await request.json();

        // Check authorization
        if (session.user.role !== 'ADMIN' && session.user.id !== id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Update employee
        const employee = await prisma.user.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(
            {
                message: 'Employee updated successfully',
                employee,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update employee error:', error);

        return NextResponse.json(
            { error: 'Failed to update employee' },
            { status: 500 }
        );
    }
}

// DELETE employee (Admin only)
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Await params for Next.js 15
        const { id } = await params;

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: 'Employee deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete employee error:', error);
        return NextResponse.json(
            { error: 'Failed to delete employee' },
            { status: 500 }
        );
    }
}
