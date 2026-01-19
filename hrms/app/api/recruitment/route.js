import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const type = searchParams.get('type'); // 'postings' or 'applications'
        const status = searchParams.get('status');
        const department = searchParams.get('department');

        const skip = (page - 1) * limit;

        if (type === 'applications') {
            const where = {
                ...(status && { status })
            };

            const [applications, total] = await Promise.all([
                prisma.jobApplication.findMany({
                    where,
                    include: {
                        jobPosting: true
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.jobApplication.count({ where })
            ]);

            return NextResponse.json({
                applications,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        } else {
            // Default to job postings
            const where = {
                ...(status && { status }),
                ...(department && { department })
            };

            const [postings, total] = await Promise.all([
                prisma.jobPosting.findMany({
                    where,
                    include: {
                        applications: {
                            select: {
                                id: true,
                                status: true
                            }
                        },
                        _count: {
                            select: {
                                applications: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.jobPosting.count({ where })
            ]);

            return NextResponse.json({
                postings,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        }
    } catch (error) {
        console.error('Recruitment fetch error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching recruitment data' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, ...data } = body;

        if (action === 'create_posting') {
            const {
                title,
                description,
                department,
                location,
                employmentType,
                experienceLevel,
                salaryRange,
                deadline,
                status = 'ACTIVE'
            } = data;

            const posting = await prisma.jobPosting.create({
                data: {
                    title,
                    description,
                    department,
                    location,
                    employmentType,
                    experienceLevel,
                    salaryRange,
                    deadline: deadline ? new Date(deadline) : null,
                    status,
                    postedBy: session.user.id
                },
                include: {
                    applications: true,
                    _count: {
                        select: {
                            applications: true
                        }
                    }
                }
            });

            return NextResponse.json(posting);
        } else if (action === 'create_application') {
            // This would typically be submitted by external candidates
            // For now, allowing admins to create for testing
            const {
                jobPostingId,
                name,
                email,
                phone,
                resumeUrl,
                coverLetter
            } = data;

            const application = await prisma.jobApplication.create({
                data: {
                    jobPostingId,
                    name,
                    email,
                    phone,
                    resumeUrl,
                    coverLetter,
                    status: 'APPLIED'
                },
                include: {
                    jobPosting: true
                }
            });

            return NextResponse.json(application);
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Recruitment creation error:', error);
        return NextResponse.json(
            { error: 'An error occurred while creating recruitment item' },
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
        const { action, id, ...data } = body;

        if (action === 'update_posting') {
            const posting = await prisma.jobPosting.update({
                where: { id },
                data: {
                    ...data,
                    ...(data.deadline && { deadline: new Date(data.deadline) })
                },
                include: {
                    applications: true,
                    _count: {
                        select: {
                            applications: true
                        }
                    }
                }
            });

            return NextResponse.json(posting);
        } else if (action === 'update_application') {
            const { status, notes, reviewedBy } = data;

            const application = await prisma.jobApplication.update({
                where: { id },
                data: {
                    status,
                    notes,
                    reviewedBy: reviewedBy || session.user.id,
                    reviewedAt: status !== 'APPLIED' ? new Date() : null
                },
                include: {
                    jobPosting: true
                }
            });

            return NextResponse.json(application);
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Recruitment update error:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating recruitment item' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const type = searchParams.get('type'); // 'posting' or 'application'

        if (!id || !type) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (type === 'posting') {
            await prisma.jobPosting.delete({
                where: { id }
            });
        } else if (type === 'application') {
            await prisma.jobApplication.delete({
                where: { id }
            });
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Recruitment deletion error:', error);
        return NextResponse.json(
            { error: 'An error occurred while deleting recruitment item' },
            { status: 500 }
        );
    }
}
