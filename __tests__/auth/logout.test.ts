import { signOut } from "@/lib/auth";

// Mock Supabase browser client
const mockSignOut = jest.fn();

jest.mock("@/lib/supabase-browser", () => ({
  createBrowserClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}));

describe("Logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should clear the session on logout", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    const result = await signOut();

    expect(mockSignOut).toHaveBeenCalled();
    expect(result.error).toBeNull();
  });

  it("should redirect to /login after logout", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    const result = await signOut();

    expect(result.error).toBeNull();
    expect(result.redirectTo).toBe("/login");
  });
});
