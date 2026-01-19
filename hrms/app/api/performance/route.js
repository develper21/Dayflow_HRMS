import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const userId = session.user.role === 'EMPLOYEE' ? session.user.id : searchParams.get('userId');
        const reviewPeriod = searchParams.get('reviewPeriod');
        const reviewType = searchParams.get('reviewType');
        const status = searchParams.get('status');

        const skip = (page - 1) * limit;

        const where = {
            ...(userId && { userId }),
            ...(reviewPeriod && { reviewPeriod }),
            ...(reviewType && { reviewType }),
            ...(status && { status })
        };

        const [reviews, total] = await Promise.all([
            prisma.performanceReview.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            employeeId: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.performanceReview.count({ where })
        ]);

        return NextResponse.json({
            reviews,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Performance reviews fetch error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching performance reviews' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            userId,
            reviewPeriod,
            reviewType,
            qualityRating,
            quantityRating,
            teamworkRating,
            initiativeRating,
            attendanceRating,
            overallRating,
            strengths,
            weaknesses,
            goals,
            recommendations,
            employeeComments
        } = body;

        // Only admins can create reviews for others, employees can only create for themselves
        if (session.user.role === 'EMPLOYEE' && userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Calculate overall rating if not provided
        const calculatedOverallRating = overallRating || 
            (qualityRating && quantityRating && teamworkRating && initiativeRating && attendanceRating
                ? (qualityRating + quantityRating + teamworkRating + initiativeRating + attendanceRating) / 5
                : null);

        const review = await prisma.performanceReview.create({
            data: {
                userId,
                reviewPeriod,
                reviewType,
                qualityRating,
                quantityRating,
                teamworkRating,
                initiativeRating,
                attendanceRating,
                overallRating: calculatedOverallRating,
                strengths,
                weaknesses,
                goals,
                recommendations,
                employeeComments,
                status: session.user.role === 'EMPLOYEE' ? 'SUBMITTED' : 'DRAFT'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        employeeId: true
                    }
                }
            }
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('Performance review creation error:', error);
        return NextResponse.json(
            { error: 'An error occurred while creating performance review' },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, reviewedBy } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const review = await prisma.performanceReview.update({
            where: { id },
            data: {
                status,
                reviewedBy: reviewedBy || session.user.id,
                reviewedAt: new Date()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        employeeId: true
                    }
                }
            }
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('Performance review update error:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating performance review' },
            { status: 500 }
        );
    }
}
