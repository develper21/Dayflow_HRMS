import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/verify-email'];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // If user is not authenticated and trying to access protected route
    if (!token && !isPublicRoute) {
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // If user is authenticated and trying to access auth pages
    if (token && isPublicRoute) {
        // Redirect based on role
        if (token.role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin', request.url));
        } else {
            return NextResponse.redirect(new URL('/dashboard/profile', request.url));
        }
    }

    // Role-based access control for protected routes
    if (token) {
        // Admin routes
        if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard/profile', request.url));
        }

        // Employee routes (if needed in future)
        if (pathname.startsWith('/employee') && token.role !== 'EMPLOYEE') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|public|api|uploads).*)',
    ],
};
