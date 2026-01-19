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
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const enrollments = searchParams.get('enrollments') === 'true';

        const skip = (page - 1) * limit;

        if (enrollments) {
            // Get user's training enrollments
            const where = {
                userId: session.user.id,
                ...(status && { status })
            };

            const [enrollments, total] = await Promise.all([
                prisma.trainingEnrollment.findMany({
                    where,
                    include: {
                        training: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                employeeId: true
                            }
                        }
                    },
                    orderBy: { enrolledAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.trainingEnrollment.count({ where })
            ]);

            return NextResponse.json({
                enrollments,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        } else {
            // Get all trainings (admin only)
            if (session.user.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const where = {
                ...(category && { category }),
                ...(status && { status })
            };

            const [trainings, total] = await Promise.all([
                prisma.training.findMany({
                    where,
                    include: {
                        enrollments: {
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
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.training.count({ where })
            ]);

            return NextResponse.json({
                trainings,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        }
    } catch (error) {
        console.error('Training fetch error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching training data' },
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
        const { action, ...data } = body;

        if (action === 'enroll') {
            // Enroll user in training
            const { trainingId } = data;
            const userId = session.user.id;

            // Check if already enrolled
            const existingEnrollment = await prisma.trainingEnrollment.findUnique({
                where: {
                    userId_trainingId: {
                        userId,
                        trainingId
                    }
                }
            });

            if (existingEnrollment) {
                return NextResponse.json({ error: 'Already enrolled in this training' }, { status: 400 });
            }

            const enrollment = await prisma.trainingEnrollment.create({
                data: {
                    userId,
                    trainingId,
                    status: 'ENROLLED'
                },
                include: {
                    training: true,
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

            return NextResponse.json(enrollment);
        } else if (action === 'create') {
            // Create new training (admin only)
            if (session.user.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const {
                title,
                description,
                category,
                duration,
                cost,
                instructor,
                startDate,
                endDate,
                status = 'PLANNED'
            } = data;

            const training = await prisma.training.create({
                data: {
                    title,
                    description,
                    category,
                    duration,
                    cost,
                    instructor,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    status
                }
            });

            return NextResponse.json(training);
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Training action error:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing training action' },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, id, ...data } = body;

        if (action === 'update_progress') {
            // Update training progress
            const { progress, score, status } = data;
            const userId = session.user.id;

            const enrollment = await prisma.trainingEnrollment.update({
                where: { id },
                data: {
                    progress,
                    ...(score && { score }),
                    ...(status && { status }),
                    ...(status === 'COMPLETED' && { completedAt: new Date() })
                },
                include: {
                    training: true,
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

            return NextResponse.json(enrollment);
        } else if (action === 'update_training') {
            // Update training details (admin only)
            if (session.user.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const training = await prisma.training.update({
                where: { id },
                data: {
                    ...data,
                    ...(data.startDate && { startDate: new Date(data.startDate) }),
                    ...(data.endDate && { endDate: new Date(data.endDate) })
                }
            });

            return NextResponse.json(training);
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Training update error:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating training' },
            { status: 500 }
        );
    }
}
