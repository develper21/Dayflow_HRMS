import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { authenticateRequest } from '@/lib/rbac';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const [user] = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      firstName: users.first_name,
      lastName: users.last_name,
      phone: users.phone,
      address: users.address,
      jobTitle: users.job_title,
      department: users.department,
      managerId: users.manager_id,
      profilePictureUrl: users.profile_picture_url,
      employeeId: users.employee_id,
      isActive: users.is_active,
      emailVerifiedAt: users.email_verified_at,
      createdAt: users.created_at,
    }).from(users).where(eq(users.id, auth.user.id)).limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
