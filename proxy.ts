import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/contact",
  "/blog(.*)",
  "/faq",
  "/support",
  "/privacy",
  "/terms",
  "/cookies",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/course",
  "/course/:id",
  "/course/learn(.*)",
  "/api/webhooks(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/course/create(.*)",
  "/course/edit(.*)",
]);

const authenticate = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) || !isPublicRoute(req)) {
    await auth.protect();
  }
});

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  // Home renders public data and resolves navbar auth in the client. Avoid
  // Clerk's session-refresh handshake on document and RSC reads, but keep
  // middleware available to authenticated server actions (POST) on this page.
  if (req.nextUrl.pathname === "/" && (req.method === "GET" || req.method === "HEAD")) {
    return NextResponse.next();
  }

  return authenticate(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
