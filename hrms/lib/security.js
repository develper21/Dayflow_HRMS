import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function auditLogMiddleware(request, userId, action, resource, resourceId = null, details = null) {
    try {
        const userAgent = request.headers.get('user-agent') || '';
        const ipAddress = request.headers.get('x-forwarded-for') || 
                         request.headers.get('x-real-ip') || 
                         request.ip || 
                         'unknown';

        await prisma.auditLog.create({
            data: {
                userId: userId || null,
                action,
                resource,
                resourceId,
                ipAddress,
                userAgent,
                details: details ? JSON.stringify(details) : null
            }
        });

        console.log(`Audit log created: ${action} on ${resource} by user ${userId || 'anonymous'}`);
    } catch (error) {
        console.error('Error creating audit log:', error);
        // Don't throw error to avoid breaking the main flow
    }
}

export const auditActions = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    VIEW: 'VIEW',
    EXPORT: 'EXPORT',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    SUBMIT: 'SUBMIT'
};

export const auditResources = {
    USER: 'USER',
    ATTENDANCE: 'ATTENDANCE',
    LEAVE_REQUEST: 'LEAVE_REQUEST',
    PAYROLL: 'PAYROLL',
    PERFORMANCE_REVIEW: 'PERFORMANCE_REVIEW',
    TRAINING: 'TRAINING',
    JOB_POSTING: 'JOB_POSTING',
    JOB_APPLICATION: 'JOB_APPLICATION',
    REPORT: 'REPORT',
    NOTIFICATION: 'NOTIFICATION'
};

// Middleware function to wrap API routes
export function withAuditLog(handler) {
    return async (request, context) => {
        const startTime = Date.now();
        
        try {
            const response = await handler(request, context);
            
            // Log successful API calls
            const url = new URL(request.url);
            const resource = getResourceFromPath(url.pathname);
            const action = getActionFromMethod(request.method);
            
            // Get user ID from session if available
            const { getServerSession } = await import('next-auth');
            const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
            const session = await getServerSession(authOptions);
            
            if (session && resource && action) {
                await auditLogMiddleware(
                    request,
                    session.user.id,
                    action,
                    resource,
                    null,
                    {
                        endpoint: url.pathname,
                        method: request.method,
                        duration: Date.now() - startTime,
                        status: response.status
                    }
                );
            }
            
            return response;
        } catch (error) {
            // Log failed API calls
            const url = new URL(request.url);
            const resource = getResourceFromPath(url.pathname);
            const action = getActionFromMethod(request.method);
            
            const { getServerSession } = await import('next-auth');
            const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
            const session = await getServerSession(authOptions);
            
            if (session && resource && action) {
                await auditLogMiddleware(
                    request,
                    session.user.id,
                    action,
                    resource,
                    null,
                    {
                        endpoint: url.pathname,
                        method: request.method,
                        duration: Date.now() - startTime,
                        error: error.message,
                        status: 500
                    }
                );
            }
            
            throw error;
        }
    };
}

function getResourceFromPath(pathname) {
    const pathParts = pathname.split('/');
    const apiIndex = pathParts.indexOf('api');
    
    if (apiIndex !== -1 && pathParts.length > apiIndex + 1) {
        const resource = pathParts[apiIndex + 1];
        
        // Map path to resource names
        const resourceMap = {
            'users': auditResources.USER,
            'attendance': auditResources.ATTENDANCE,
            'leave': auditResources.LEAVE_REQUEST,
            'payroll': auditResources.PAYROLL,
            'performance': auditResources.PERFORMANCE_REVIEW,
            'training': auditResources.TRAINING,
            'recruitment': auditResources.JOB_POSTING,
            'reports': auditResources.REPORT,
            'notifications': auditResources.NOTIFICATION,
            'auth': auditResources.USER
        };
        
        return resourceMap[resource] || resource.toUpperCase();
    }
    
    return null;
}

function getActionFromMethod(method) {
    const methodMap = {
        'GET': auditActions.VIEW,
        'POST': auditActions.CREATE,
        'PATCH': auditActions.UPDATE,
        'PUT': auditActions.UPDATE,
        'DELETE': auditActions.DELETE
    };
    
    return methodMap[method] || method;
}

// Helper function to log specific business actions
export async function logBusinessAction(request, userId, action, resource, resourceId, details) {
    await auditLogMiddleware(request, userId, action, resource, resourceId, details);
}

// Rate limiting middleware
const rateLimitMap = new Map();

export function rateLimit(maxRequests = 100, windowMs = 60000) {
    return function(request, context) {
        const clientId = getClientId(request);
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!rateLimitMap.has(clientId)) {
            rateLimitMap.set(clientId, []);
        }
        
        const requests = rateLimitMap.get(clientId);
        
        // Remove old requests outside the window
        const validRequests = requests.filter(timestamp => timestamp > windowStart);
        rateLimitMap.set(clientId, validRequests);
        
        if (validRequests.length >= maxRequests) {
            return NextResponse.json(
                { error: 'Too many requests, please try again later' },
                { status: 429 }
            );
        }
        
        // Add current request
        validRequests.push(now);
        
        return null; // Continue with the request
    };
}

function getClientId(request) {
    // Try to get user ID from session first
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               request.ip || 
               'unknown';
    
    return ip;
}

// Security headers middleware
export function addSecurityHeaders(response) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
}
