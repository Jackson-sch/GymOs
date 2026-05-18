import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/security";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 Proxy
 * This replaces the deprecated middleware.ts convention.
 * It handles authentication, RBAC redirections, API security, and injects headers.
 */
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const pathname = request.nextUrl.pathname;

  // Ignorar recursos estáticos de Next.js y archivos multimedia
  if (pathname.startsWith("/_next") || pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|woff2?|css|js|json)$/)) {
    return NextResponse.next();
  }

  // Intercept API routes
  if (pathname.startsWith("/api")) {
    const isPublicApi = pathname.startsWith("/api/auth") ||
                        pathname.startsWith("/api/webhooks") ||
                        pathname.startsWith("/api/cron") ||
                        pathname.startsWith("/api/health") ||
                        pathname.startsWith("/api/checkin");

    if (!session && !isPublicApi) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED: API protegida" }, { status: 401 });
    }
    return NextResponse.next();
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
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Handle authenticated users
  if (session) {
    const role = getUserRole(session);

    // Redirect away from login if already authenticated
    if (isAuthPage) {
      if (role === "MEMBER") return NextResponse.redirect(new URL("/portal", request.url));
      if (role === "TRAINER") return NextResponse.redirect(new URL("/portal/trainer", request.url));
      if (role === "RECEPTIONIST") return NextResponse.redirect(new URL("/", request.url));
      return NextResponse.redirect(new URL("/", request.url));
    }

    // RBAC: Protect admin routes and redirect trainers/members to their portals
    const isAdminRoute = !isPortalPage && !isPublicPage && !isRoot;
    
    // Allow trainers to access specific shared management tools
    const trainerAllowedRoutes = ["/attendance", "/classes", "/routines"];
    const isTrainerAllowed = trainerAllowedRoutes.some(route => pathname.startsWith(route));

    if (role === "TRAINER" && (isAdminRoute || isRoot) && !isTrainerAllowed) {
      return NextResponse.redirect(new URL("/portal/trainer", request.url));
    }

    // Proteger rutas estrictas de Super Admin / Admin frente a Recepcionistas
    const superAdminRoutes = ["/settings", "/audit-log", "/expenses", "/reports", "/trainers", "/payroll"];
    const isSuperAdminRoute = superAdminRoutes.some(route => pathname.startsWith(route));

    if (role === "RECEPTIONIST" && isSuperAdminRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (role === "MEMBER" && !isPortalPage) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

