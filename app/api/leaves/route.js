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
        const userId = searchParams.get('userId');

        let where = {};

        // If not ADMIN, can only see own leaves
        if (session.user.role !== 'ADMIN') {
            where.userId = session.user.id;
        } else if (userId) {
            // Admin can filter by userId
            where.userId = userId;
        } else {
            // Admin sees leaves from their company
            where.user = {
                companyId: session.user.companyId
            };
        }

        const leaves = await prisma.leaveRequest.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        employeeId: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ leaves });
    } catch (error) {
        console.error('Fetch leaves error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching leave requests' },
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

        const { type, startDate, endDate, reason, attachmentUrl } = await request.json();

        if (!type || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                userId: session.user.id,
                type,
                startDate: start,
                endDate: end,
                days: diffDays,
                reason,
                attachmentUrl,
                status: 'PENDING',
            },
        });

        // Create notification for Admin (optional but good)
        // Find Admins in the same company
        const admins = await prisma.user.findMany({
            where: {
                companyId: session.user.companyId,
                role: 'ADMIN',
            }
        });

        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: 'LEAVE_REQUEST',
                    title: 'New Leave Request',
                    message: `${session.user.name} has requested ${diffDays} day(s) of ${type.toLowerCase()} leave.`,
                }
            });
        }

        return NextResponse.json({
            message: 'Leave request submitted successfully',
            leaveRequest,
        });
    } catch (error) {
        console.error('Submit leave error:', error);
        return NextResponse.json(
            { error: 'An error occurred while submitting leave request' },
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

        const { id, status, adminComment } = await request.json();

        if (!id || !status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const leaveRequest = await prisma.leaveRequest.update({
            where: { id },
            data: {
                status,
                adminComment,
            },
        });

        // Create notification for Employee
        await prisma.notification.create({
            data: {
                userId: leaveRequest.userId,
                type: 'LEAVE_UPDATE',
                title: `Leave Request ${status.toLowerCase()}`,
                message: `Your leave request for ${leaveRequest.type.toLowerCase()} has been ${status.toLowerCase()}.`,
            }
        });

        return NextResponse.json({
            message: `Leave request ${status.toLowerCase()} successfully`,
            leaveRequest,
        });
    } catch (error) {
        console.error('Update leave error:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating leave request' },
            { status: 500 }
        );
    }
}
