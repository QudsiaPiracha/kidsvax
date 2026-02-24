// Mock next/server - must use inline jest.fn() since jest.mock is hoisted
jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(() => ({ type: "next" })),
    redirect: jest.fn((url: URL) => ({
      type: "redirect",
      url: url.toString(),
    })),
  },
}));

// Mock Supabase server client
const mockGetUser = jest.fn();

jest.mock("@/lib/supabase-server", () => ({
  createServerClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
  }),
}));

// Import after mocks are set up
import { NextResponse } from "next/server";
import { middleware } from "@/middleware";

interface MockRequest {
  nextUrl: URL;
  url: string;
  headers: Headers;
  cookies: { getAll: () => never[]; set: jest.Mock };
}

function createMockRequest(pathname: string): MockRequest {
  const url = new URL(pathname, "http://localhost:3000");
  return {
    nextUrl: url,
    url: url.toString(),
    headers: new Headers(),
    cookies: { getAll: () => [], set: jest.fn() },
  };
}

describe("Auth Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect unauthenticated user from /dashboard to /login", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "not authenticated" },
    });

    const req = createMockRequest("/dashboard");
    await middleware(req as never);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/login" })
    );
  });

  it("should allow authenticated user to access /dashboard", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const req = createMockRequest("/dashboard");
    await middleware(req as never);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("should redirect authenticated user from /login to /dashboard", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const req = createMockRequest("/login");
    await middleware(req as never);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/dashboard" })
    );
  });

  it("should allow unauthenticated user to access /login", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "not authenticated" },
    });

    const req = createMockRequest("/login");
    await middleware(req as never);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("should allow unauthenticated user to access /signup", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "not authenticated" },
    });

    const req = createMockRequest("/signup");
    await middleware(req as never);

    expect(NextResponse.next).toHaveBeenCalled();
  });
});
