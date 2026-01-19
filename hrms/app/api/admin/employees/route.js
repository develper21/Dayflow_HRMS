import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth-utils';
import { generateEmployeeId, generateRandomPassword, formatEmployeeName } from '@/lib/employee-utils';
import { addEmployeeSchema } from '@/lib/validations/auth';

// POST create new employee (Admin only)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input
        const validatedData = addEmployeeSchema.parse(body);

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Get HR user's company
        const hrUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { company: true },
        });

        if (!hrUser || !hrUser.companyId) {
            return NextResponse.json(
                { error: 'HR user company not found' },
                { status: 400 }
            );
        }

        // Extract year from date of joining
        const joiningDate = new Date(validatedData.dateOfJoining);
        const yearOfJoining = joiningDate.getFullYear();

        // Generate Employee ID
        const employeeId = await generateEmployeeId(
            validatedData.firstName,
            validatedData.lastName,
            yearOfJoining,
            hrUser.companyId
        );

        // Generate random password
        const plainPassword = generateRandomPassword();
        const hashedPassword = await hashPassword(plainPassword);

        // Format full name
        const fullName = formatEmployeeName(validatedData.firstName, validatedData.lastName);

        // Create employee with all related data in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create employee user
            const employee = await tx.user.create({
                data: {
                    employeeId,
                    email: validatedData.email,
                    password: hashedPassword,
                    name: fullName,
                    phone: validatedData.phone || null,
                    role: 'EMPLOYEE',
                    companyId: hrUser.companyId,
                    emailVerified: true, // Auto-verify for admin-created accounts
                },
            });

            // Create employee profile
            await tx.employeeProfile.create({
                data: {
                    userId: employee.id,
                    dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
                    gender: validatedData.gender || null,
                    maritalStatus: validatedData.maritalStatus || null,
                    nationality: validatedData.nationality || null,
                    residingAddress: validatedData.residingAddress || null,
                    accountNumber: validatedData.accountNumber || null,
                    bankName: validatedData.bankName || null,
                    ifscCode: validatedData.ifscCode || null,
                    panNumber: validatedData.panNumber || null,
                    uanNumber: validatedData.uanNumber || null,
                },
            });

            // Create job details
            await tx.jobDetails.create({
                data: {
                    userId: employee.id,
                    jobPosition: validatedData.jobPosition,
                    department: validatedData.department,
                    dateOfJoining: joiningDate,
                    manager: validatedData.manager || null,
                    workLocation: validatedData.workLocation || null,
                },
            });

            // Create salary structure if provided
            if (validatedData.monthlyWage && validatedData.monthlyWage > 0) {
                await tx.salaryStructure.create({
                    data: {
                        userId: employee.id,
                        monthlyWage: validatedData.monthlyWage,
                        yearlyWage: validatedData.monthlyWage * 12,
                    },
                });
            }

            return employee;
        });

        return NextResponse.json(
            {
                message: 'Employee created successfully',
                employee: {
                    id: result.id,
                    name: result.name,
                    email: result.email,
                    employeeId: result.employeeId,
                    password: plainPassword, // Return plain password to show to admin
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create employee error:', error);

        // Handle Zod validation errors
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create employee' },
            { status: 500 }
        );
    }
}

// GET all employees (Admin only)
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get HR user's company
        const hrUser = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!hrUser || !hrUser.companyId) {
            return NextResponse.json(
                { error: 'HR user company not found' },
                { status: 400 }
            );
        }

        const employees = await prisma.user.findMany({
            where: {
                role: 'EMPLOYEE',
                companyId: hrUser.companyId,
            },
            include: {
                profile: true,
                jobDetails: true,
                salaryStructure: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ employees }, { status: 200 });
    } catch (error) {
        console.error('Get employees error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch employees' },
            { status: 500 }
        );
    }
}
