import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/rbac';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const notificationId = id;

    const updatedNotification = await db
      .update(notifications)
      .set({ is_read: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.user_id, auth.user.id)
        )
      )
      .returning();

    if (updatedNotification.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedNotification[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
