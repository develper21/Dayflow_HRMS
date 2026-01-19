import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, generateVerificationToken } from '@/lib/auth-utils';
import { hrSignupSchema } from '@/lib/validations/auth';

export async function POST(request) {
    try {
        const body = await request.json();

        // Validate input (without logo in schema)
        const { companyLogo, ...validationData } = body;
        const validatedData = hrSignupSchema.parse(validationData);

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Check if company name already exists
        const existingCompany = await prisma.company.findUnique({
            where: { name: validatedData.companyName },
        });

        if (existingCompany) {
            return NextResponse.json(
                { error: 'Company name already registered' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(validatedData.password);

        // Generate verification token
        const { token, expiry } = generateVerificationToken();

        // Create company and HR user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create company with logo
            const company = await tx.company.create({
                data: {
                    name: validatedData.companyName,
                    logo: companyLogo || null,
                },
            });

            // Create HR user
            const user = await tx.user.create({
                data: {
                    email: validatedData.email,
                    password: hashedPassword,
                    name: validatedData.name,
                    phone: validatedData.phone,
                    role: 'ADMIN', // HR is ADMIN
                    companyId: company.id,
                    verificationToken: token,
                    verificationTokenExpiry: expiry,
                    emailVerified: true, // Auto-verify HR accounts
                },
            });

            return { company, user };
        });

        // In production, send verification email here
        const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

        return NextResponse.json(
            {
                message: 'HR account created successfully',
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    company: result.company.name,
                },
                // For development only - remove in production
                ...(process.env.NODE_ENV === 'development' && {
                    verificationUrl,
                }),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);

        // Handle Zod validation errors
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        );
    }
}
