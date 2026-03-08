import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Verification token is required' },
                { status: 400 }
            );
        }

        // Find user with this token
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid verification token' },
                { status: 400 }
            );
        }

        // Check if token has expired
        if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
            return NextResponse.json(
                { error: 'Verification token has expired' },
                { status: 400 }
            );
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json(
                { message: 'Email already verified' },
                { status: 200 }
            );
        }

        // Update user to verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null,
            },
        });

        return NextResponse.json(
            { message: 'Email verified successfully! You can now login.' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'An error occurred during verification' },
            { status: 500 }
        );
    }
}
