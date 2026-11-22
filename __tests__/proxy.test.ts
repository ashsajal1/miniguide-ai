// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse, type NextFetchEvent } from "next/server";

const { authenticate, protect } = vi.hoisted(() => ({
  authenticate: vi.fn(),
  protect: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@clerk/nextjs/server")>();
  return {
    ...actual,
    clerkMiddleware: (handler: (auth: unknown, req: NextRequest) => Promise<void>) => {
      authenticate.mockImplementation(async (req: NextRequest) => {
        await handler({ protect }, req);
        return NextResponse.next();
      });
      return authenticate;
    },
  };
});

import proxy from "../proxy";

const event = {} as NextFetchEvent;

beforeEach(() => {
  vi.clearAllMocks();
  protect.mockResolvedValue(undefined);
});

describe("home page authentication", () => {
  it.each(["GET", "HEAD"])("provides Clerk context for home %s without protecting", async (method) => {
    const response = await proxy(new NextRequest("https://example.com/", {
      method,
      headers: { cookie: "__session=expired", accept: "text/html" },
    }), event);
    expect(response?.status).toBe(200);
    expect(response?.headers.get("location")).toBeNull();
    expect(authenticate).toHaveBeenCalledOnce();
    expect(protect).not.toHaveBeenCalled();
  });

  it("provides Clerk context for home RSC navigation", async () => {
    await proxy(new NextRequest("https://example.com/?_rsc=test", {
      headers: { RSC: "1" },
    }), event);
    expect(authenticate).toHaveBeenCalledOnce();
  });

  it("provides Clerk context for home server actions", async () => {
    await proxy(new NextRequest("https://example.com/", { method: "POST" }), event);
    expect(authenticate).toHaveBeenCalledOnce();
  });
});

describe("route protection", () => {
  it.each(["/course/create", "/course/create/url", "/course/create/manual", "/course/edit/123", "/profile", "/saved", "/admin", "/api/private"])("protects %s exactly once", async (path) => {
    await proxy(new NextRequest(`https://example.com${path}`), event);
    expect(authenticate).toHaveBeenCalledOnce();
    expect(protect).toHaveBeenCalledOnce();
  });

  it.each(["/course", "/course/123", "/course/learn/123", "/sign-in", "/sign-up", "/blog", "/blog/how-to-use-minicourse", "/faq", "/support", "/privacy", "/terms", "/cookies", "/api/webhooks/clerk"])("keeps %s public with Clerk context", async (path) => {
    await proxy(new NextRequest(`https://example.com${path}`), event);
    expect(authenticate).toHaveBeenCalledOnce();
    expect(protect).not.toHaveBeenCalled();
  });

  it("propagates a protection failure instead of bypassing it", async () => {
    protect.mockRejectedValueOnce(new Error("unauthenticated"));
    await expect(proxy(new NextRequest("https://example.com/course/create/url"), event)).rejects.toThrow("unauthenticated");
  });
});
