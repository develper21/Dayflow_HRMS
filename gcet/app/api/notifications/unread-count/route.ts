import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    // Get unread notification count
    const unreadCount = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.user_id, auth.user.id),
        eq(notifications.is_read, false)
      ));

    return NextResponse.json({
      unreadCount: unreadCount[0]?.count || 0
    });

  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
