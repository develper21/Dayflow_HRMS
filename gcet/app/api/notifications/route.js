import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import NotificationService from '@/lib/notifications';

const notificationService = new NotificationService();

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        const skip = (page - 1) * limit;

        const where = {
            userId: session.user.id,
            ...(unreadOnly && { isRead: false })
        };

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({
                where: {
                    userId: session.user.id,
                    isRead: false
                }
            })
        ]);

        return NextResponse.json({
            notifications,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            unreadCount
        });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching notifications' },
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
        const { userId, type, title, message, priority = 'NORMAL', category = 'SYSTEM', actionUrl, actionText } = body;

        if (!userId || !type || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const notification = await notificationService.createNotification({
            userId,
            type,
            title,
            message,
            priority,
            category,
            actionUrl,
            actionText
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, markAll } = await request.json();

        if (id) {
            await prisma.notification.update({
                where: { id },
                data: { isRead: true },
            });
        } else if (markAll) {
            // Mark all as read
            await prisma.notification.updateMany({
                where: { userId: session.user.id },
                data: { isRead: true },
            });
        }

        return NextResponse.json({ message: 'Notifications updated' });
    } catch (error) {
        console.error('Update notifications error:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating notifications' },
            { status: 500 }
        );
    }
}
