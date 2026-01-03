import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Invalid notification IDs' },
        { status: 400 }
      );
    }

    // Mark multiple notifications as read
    const updatedNotifications = await db
      .update(notifications)
      .set({ is_read: true })
      .where(and(
        eq(notifications.user_id, auth.user.id),
        inArray(notifications.id, notificationIds)
      ))
      .returning();

    return NextResponse.json({
      message: `${updatedNotifications.length} notifications marked as read`,
      count: updatedNotifications.length
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
