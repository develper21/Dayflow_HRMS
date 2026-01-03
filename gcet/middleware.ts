import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthCookie, verifyToken } from './lib/auth';

// Define public routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
];

// Define role-based route protection
const roleBasedRoutes = {
  '/employees': ['hr', 'admin'],
  '/reports': ['hr', 'admin'],
  '/settings': ['admin'],
  '/api/employees': ['hr', 'admin'],
  '/api/reports': ['hr', 'admin'],
  '/api/users': ['hr', 'admin'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = await getAuthCookie();
  
  if (!token) {
    // Redirect to login if accessing protected route without token
    if (pathname.startsWith('/app/') || pathname.startsWith('/api/') || 
        pathname === '/' || pathname.startsWith('/dashboard') || 
        pathname.startsWith('/attendance') || pathname.startsWith('/documents') ||
        pathname.startsWith('/leave') || pathname.startsWith('/payroll')) {
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Verify token
  const payload = verifyToken(token);
  
  if (!payload) {
    // Token is invalid, redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    
    // Clear the invalid token
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    return response;
  }

  // Check role-based access for specific routes
  const protectedRoute = Object.keys(roleBasedRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (protectedRoute && roleBasedRoutes[protectedRoute as keyof typeof roleBasedRoutes]) {
    const requiredRoles = roleBasedRoutes[protectedRoute as keyof typeof roleBasedRoutes];
    
    if (!requiredRoles.includes(payload.role)) {
      // User doesn't have required role, redirect to dashboard with error
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'insufficient_permissions');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
