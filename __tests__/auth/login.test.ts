import { signIn, sendMagicLink } from "@/lib/auth";

// Mock Supabase browser client
const mockSignInWithPassword = jest.fn();
const mockSignInWithOtp = jest.fn();

jest.mock("@/lib/supabase-browser", () => ({
  createBrowserClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOtp: mockSignInWithOtp,
    },
  }),
}));

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return session for valid email + password", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: { id: "user-123", email: "test@example.com" },
        session: { access_token: "token-abc" },
      },
      error: null,
    });

    const result = await signIn("test@example.com", "securePass123");

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "securePass123",
    });
    expect(result.error).toBeNull();
    expect(result.data?.session?.access_token).toBe("token-abc");
  });

  it("should reject login with wrong password", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials", status: 400 },
    });

    const result = await signIn("test@example.com", "wrongPassword");

    expect(result.error).toBeTruthy();
    expect(result.error?.message).toMatch(/invalid login credentials/i);
  });

  it("should reject login with non-existent email", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials", status: 400 },
    });

    const result = await signIn("nobody@example.com", "anyPassword");

    expect(result.error).toBeTruthy();
    expect(result.error?.message).toMatch(/invalid login credentials/i);
  });

  it("should send magic link email for valid email", async () => {
    mockSignInWithOtp.mockResolvedValue({
      data: {},
      error: null,
    });

    const result = await sendMagicLink("user@example.com");

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "user@example.com",
      options: { emailRedirectTo: expect.stringContaining("/auth/callback") },
    });
    expect(result.error).toBeNull();
  });
});
