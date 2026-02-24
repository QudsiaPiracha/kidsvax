import { signUp } from "@/lib/auth";

// Mock Supabase browser client
const mockSignUp = jest.fn();
const mockFrom = jest.fn();
const mockInsert = jest.fn();

jest.mock("@/lib/supabase-browser", () => ({
  createBrowserClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
    from: mockFrom,
  }),
}));

describe("Signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue({ insert: mockInsert });
  });

  it("should create a new user with valid email and password", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: "user-123", email: "test@example.com" },
        session: { access_token: "token-abc" },
      },
      error: null,
    });

    const result = await signUp("test@example.com", "securePass123");

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "securePass123",
    });
    expect(result.error).toBeNull();
    expect(result.data?.user?.email).toBe("test@example.com");
  });

  it("should reject signup with invalid email format", async () => {
    const result = await signUp("not-an-email", "securePass123");

    expect(result.error).toBeTruthy();
    expect(result.error?.message).toMatch(/invalid email/i);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should reject signup with password shorter than 8 characters", async () => {
    const result = await signUp("test@example.com", "short");

    expect(result.error).toBeTruthy();
    expect(result.error?.message).toMatch(/at least 8 characters/i);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should reject signup with already registered email", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "User already registered", status: 400 },
    });

    const result = await signUp("existing@example.com", "securePass123");

    expect(result.error).toBeTruthy();
    expect(result.error?.message).toMatch(/already registered/i);
  });

  it("should create a user profile row with default language 'en'", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: "user-456", email: "new@example.com" },
        session: { access_token: "token-def" },
      },
      error: null,
    });
    mockInsert.mockResolvedValue({ error: null });

    await signUp("new@example.com", "securePass123");

    expect(mockFrom).toHaveBeenCalledWith("user_profile");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ preferred_language: "en" })
    );
  });

  it("should create a user profile row with null bundesland", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: "user-789", email: "new2@example.com" },
        session: { access_token: "token-ghi" },
      },
      error: null,
    });
    mockInsert.mockResolvedValue({ error: null });

    await signUp("new2@example.com", "securePass123");

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ bundesland: null })
    );
  });
});
