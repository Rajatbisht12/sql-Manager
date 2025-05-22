import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected API routes that require authentication
const protectedApiRoutes = [
  '/api/connection',
  '/api/databases',
  '/api/tables',
  '/api/records',
  '/api/query',
];

// Define routes that only admin users can access
const adminOnlyApiRoutes = [
  '/api/records',  // Only admins can modify records
  '/api/tables',   // Only admins can create/delete tables
  '/api/databases' // Only admins can create/delete databases
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  
  // Don't apply middleware to next-auth routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Check if this is a protected API route
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));
  if (isProtectedApiRoute) {
    // Get the session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    // Redirect to sign-in if not authenticated
    if (!token) {
      // For API routes, return 401 Unauthorized
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'content-type': 'application/json' }
        }
      );
    }
    
    // Check if this is an admin-only route and if it's a write operation (POST, PUT, DELETE)
    const isWriteOperation = ['POST', 'PUT', 'DELETE'].includes(method);
    const isAdminOnlyRoute = adminOnlyApiRoutes.some(route => pathname.startsWith(route));
    
    if (isWriteOperation && isAdminOnlyRoute && token.role !== 'admin') {
      // For API routes, return 403 Forbidden
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Admin access required for this operation' }),
        { 
          status: 403,
          headers: { 'content-type': 'application/json' }
        }
      );
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 