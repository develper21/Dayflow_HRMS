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

        if (session.user.role === 'ADMIN') {
            const payrolls = await prisma.payroll.findMany({
                where: userId ? { userId } : {
                    user: { companyId: session.user.companyId }
                },
                include: {
                    user: {
                        select: { name: true, employeeId: true }
                    }
                },
                orderBy: [{ year: 'desc' }, { month: 'desc' }]
            });
            return NextResponse.json({ payrolls });
        } else {
            const payrolls = await prisma.payroll.findMany({
                where: { userId: session.user.id },
                orderBy: [{ year: 'desc' }, { month: 'desc' }]
            });
            return NextResponse.json({ payrolls });
        }
    } catch (error) {
        console.error('Fetch payroll error:', error);
        return NextResponse.json({ error: 'Failed to fetch payroll' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, month, year, status } = await request.json();

        // Basic validation
        if (!userId || !month || !year) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Fetch salary structure for calculation
        const salary = await prisma.salaryStructure.findUnique({
            where: { userId }
        });

        if (!salary) {
            return NextResponse.json({ error: 'Salary structure not found for this user' }, { status: 404 });
        }

        const basicSalary = salary.basicSalary || 0;
        const allowances = (salary.houseRentAllowance || 0) + (salary.standardAllowance || 0) + (salary.fuelAllowance || 0);
        const deductions = (salary.employeePF || 0) + (salary.professionalTax || 0);
        const netSalary = basicSalary + allowances - deductions;

        const payroll = await prisma.payroll.upsert({
            where: {
                userId_month_year: { userId, month: parseInt(month), year: parseInt(year) }
            },
            update: {
                status: status || 'PAID',
                basicSalary,
                allowances,
                deductions,
                netSalary
            },
            create: {
                userId,
                month: parseInt(month),
                year: parseInt(year),
                status: status || 'PAID',
                basicSalary,
                allowances,
                deductions,
                netSalary
            }
        });

        return NextResponse.json({ message: 'Payroll updated successfully', payroll });
    } catch (error) {
        console.error('Update payroll error:', error);
        return NextResponse.json({ error: 'Failed to update payroll' }, { status: 500 });
    }
}
