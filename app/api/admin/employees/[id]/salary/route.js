import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin only' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const salaryData = await request.json();

        // Update or create salary structure
        const salary = await prisma.salaryStructure.upsert({
            where: { userId: id },
            update: {
                monthlyWage: salaryData.monthlyWage,
                yearlyWage: salaryData.yearlyWage,
                workingDaysPerWeek: salaryData.workingDaysPerWeek,

                basicSalary: salaryData.basicSalary,
                basicSalaryPercent: salaryData.basicSalaryPercent,

                houseRentAllowance: salaryData.houseRentAllowance,
                hraPercent: salaryData.hraPercent,

                standardAllowance: salaryData.standardAllowance,

                performanceBonus: salaryData.performanceBonus,
                performanceBonusPercent: salaryData.performanceBonusPercent,

                leaveTravelAllowance: salaryData.leaveTravelAllowance,
                ltaPercent: salaryData.ltaPercent,

                fuelAllowance: salaryData.fuelAllowance,

                employeePF: salaryData.employeePF,
                employeePFPercent: salaryData.employeePFPercent,

                employerPF: salaryData.employerPF,
                employerPFPercent: salaryData.employerPFPercent,

                professionalTax: salaryData.professionalTax,
            },
            create: {
                userId: id,
                monthlyWage: salaryData.monthlyWage,
                yearlyWage: salaryData.yearlyWage,
                workingDaysPerWeek: salaryData.workingDaysPerWeek,

                basicSalary: salaryData.basicSalary,
                basicSalaryPercent: salaryData.basicSalaryPercent,

                houseRentAllowance: salaryData.houseRentAllowance,
                hraPercent: salaryData.hraPercent,

                standardAllowance: salaryData.standardAllowance,

                performanceBonus: salaryData.performanceBonus,
                performanceBonusPercent: salaryData.performanceBonusPercent,

                leaveTravelAllowance: salaryData.leaveTravelAllowance,
                ltaPercent: salaryData.ltaPercent,

                fuelAllowance: salaryData.fuelAllowance,

                employeePF: salaryData.employeePF,
                employeePFPercent: salaryData.employeePFPercent,

                employerPF: salaryData.employerPF,
                employerPFPercent: salaryData.employerPFPercent,

                professionalTax: salaryData.professionalTax,
            },
        });

        return NextResponse.json(
            {
                message: 'Salary structure saved successfully',
                salary,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Save salary error:', error);
        return NextResponse.json(
            { error: 'Failed to save salary structure' },
            { status: 500 }
        );
    }
}
