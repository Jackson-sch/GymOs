import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/security";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 Proxy
 * This replaces the deprecated middleware.ts convention.
 * It handles authentication, RBAC redirections, API security, and injects headers.
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=()");
  
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  
  return response;
}

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const pathname = request.nextUrl.pathname;

  // Ignorar recursos estáticos de Next.js y archivos multimedia
  if (pathname.startsWith("/_next") || pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|woff2?|css|js|json)$/)) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Intercept API routes
  if (pathname.startsWith("/api")) {
    const isPublicApi = pathname.startsWith("/api/auth") ||
                        pathname.startsWith("/api/webhooks") ||
                        pathname.startsWith("/api/cron") ||
                        pathname.startsWith("/api/health") ||
                        pathname.startsWith("/api/checkin");

    if (!session && !isPublicApi) {
      return applySecurityHeaders(NextResponse.json({ success: false, error: "UNAUTHORIZED: API protegida" }, { status: 401 }));
    }
    return applySecurityHeaders(NextResponse.next());
  }
  
  // Public routes that should never be intercepted
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/reset-password");
  const isPublicPage = isAuthPage || pathname.startsWith("/checkin") || pathname.startsWith("/kiosk");
  
  // Portal and Admin routes identification
  const isPortalPage = pathname.startsWith("/portal");
  const isRoot = pathname === "/";

  // Inject x-pathname header for Server Component layouts (to detect current route)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // 1. Redirect unauthenticated users to login
  if (!session && !isPublicPage) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }

  // 2. Handle authenticated users
  if (session) {
    const role = getUserRole(session);
    const user = session.user as any;

    // Forzar cambio de contraseña si mustChangePassword es true
    if (user.mustChangePassword && pathname !== "/force-change-password") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/force-change-password", request.url)));
    }

    if (pathname === "/force-change-password") {
      return applySecurityHeaders(NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      }));
    }

    // Redirect away from login if already authenticated
    if (isAuthPage) {
      if (role === "SUPER_ADMIN") return applySecurityHeaders(NextResponse.redirect(new URL("/super-admin", request.url)));
      if (role === "MEMBER") return applySecurityHeaders(NextResponse.redirect(new URL("/portal", request.url)));
      if (role === "TRAINER") return applySecurityHeaders(NextResponse.redirect(new URL("/portal/trainer", request.url)));
      return applySecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
    }

    if (isRoot && role === "SUPER_ADMIN") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/super-admin", request.url)));
    }

    // RBAC: Protect admin routes and redirect trainers/members to their portals
    const isAdminRoute = !isPortalPage && !isPublicPage && !isRoot;
    
    // Allow trainers to access specific shared management tools
    const trainerAllowedRoutes = ["/attendance", "/classes", "/routines"];
    const isTrainerAllowed = trainerAllowedRoutes.some(route => pathname.startsWith(route));

    if (role === "TRAINER" && (isAdminRoute || isRoot) && !isTrainerAllowed) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/portal/trainer", request.url)));
    }

    if (pathname.startsWith("/super-admin") && role !== "SUPER_ADMIN") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
    }

    const superAdminRoutes = ["/settings", "/audit-log", "/expenses", "/reports", "/trainers", "/payroll"];
    const isSuperAdminRoute = superAdminRoutes.some(route => pathname.startsWith(route));

    if (role === "RECEPTIONIST" && isSuperAdminRoute) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
    }

    if (role === "MEMBER" && !isPortalPage) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/portal", request.url)));
    }
  }

  return applySecurityHeaders(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};




