import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().regex(/^[0-9]{10}$/).optional().or(z.literal('')),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    maritalStatus: z.string().optional(),
    nationality: z.string().optional(),
    personalEmail: z.string().email().optional().or(z.literal('')),
    residingAddress: z.string().optional(),
    about: z.string().optional(),
    jobLoves: z.string().optional(),
    interestsHobbies: z.string().optional(),
    jobPosition: z.string().optional(),
    department: z.string().optional(),
    manager: z.string().optional(),
    workLocation: z.string().optional(),
});

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = params.userId;

        // Check access: Employee can only view own profile, Admin can view any
        if (session.user.role !== 'ADMIN' && session.user.id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                jobDetails: true,
                salaryStructure: true,
                documents: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                employeeId: user.employeeId,
                role: user.role,
            },
            profile: user.profile,
            jobDetails: user.jobDetails,
            salaryStructure: user.salaryStructure,
            documents: user.documents,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching profile' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = params.userId;
        const isAdmin = session.user.role === 'ADMIN';

        // Check access: Employee can only edit own profile, Admin can edit any
        if (!isAdmin && session.user.id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const validatedData = updateProfileSchema.parse(body);

        // Update user basic info (only admin can update name)
        if (isAdmin && validatedData.name) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    name: validatedData.name,
                    phone: validatedData.phone || null,
                },
            });
        } else if (validatedData.phone !== undefined) {
            // Employees can only update phone
            await prisma.user.update({
                where: { id: userId },
                data: {
                    phone: validatedData.phone || null,
                },
            });
        }

        // Update or create profile
        const profileData = {
            dateOfBirth: validatedData.dateOfBirth
                ? new Date(validatedData.dateOfBirth)
                : null,
            gender: validatedData.gender || null,
            maritalStatus: validatedData.maritalStatus || null,
            nationality: validatedData.nationality || null,
            personalEmail: validatedData.personalEmail || null,
            residingAddress: validatedData.residingAddress || null,
            about: validatedData.about || null,
            jobLoves: validatedData.jobLoves || null,
            interestsHobbies: validatedData.interestsHobbies || null,
        };

        await prisma.employeeProfile.upsert({
            where: { userId: userId },
            update: profileData,
            create: {
                userId: userId,
                ...profileData,
            },
        });

        // Update job details (only admin)
        if (isAdmin) {
            const jobData = {
                jobPosition: validatedData.jobPosition || null,
                department: validatedData.department || null,
                manager: validatedData.manager || null,
                workLocation: validatedData.workLocation || null,
            };

            await prisma.jobDetails.upsert({
                where: { userId: userId },
                update: jobData,
                create: {
                    userId: userId,
                    ...jobData,
                },
            });
        }

        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'An error occurred while updating profile' },
            { status: 500 }
        );
    }
}
