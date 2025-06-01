import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Allow access to auth pages without authentication
    if (pathname.startsWith("/auth/")) {
      return NextResponse.next();
    }

    // Redirect to login if not authenticated
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Role-based access control
    if (pathname.startsWith("/doctor/") && token.role !== "doctor") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (pathname.startsWith("/patient/") && token.role !== "patient") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to auth pages
        if (pathname.startsWith("/auth/")) {
          return true;
        }

        // Allow access to API routes
        if (pathname.startsWith("/api/")) {
          return true;
        }

        // Require authentication for protected routes
        if (pathname.startsWith("/doctor/") || pathname.startsWith("/patient/")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
