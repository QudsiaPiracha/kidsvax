import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InsightsPage from "@/app/(protected)/children/[id]/insights/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "child-123" }),
  useRouter: () => ({ push: mockPush }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const childResponse = {
  child: { id: "child-123", name: "Emma", date_of_birth: "2024-08-24", gender: "female" },
};

const insightsResponse = {
  insights: [
    {
      id: "ins-1",
      content: JSON.stringify({
        growth_summary: "Emma is tracking well along the 50th percentile.",
        dietary_suggestions: "Introduce iron-rich foods like lentils and leafy greens.",
        activity_tips: "Encourage climbing and balancing activities.",
        doctor_questions: "Ask about vitamin D supplementation.",
      }),
      language: "en",
      created_at: "2026-02-20T10:00:00Z",
      expires_at: "2026-02-27T10:00:00Z",
    },
  ],
};

function setupFetch(overrides?: { insightsEmpty?: boolean }) {
  mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
    if (opts?.method === "POST" && url.includes("/insights/refresh")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ insight: { id: "new" } }) });
    }
    if (url.includes("/insights")) {
      const ins = overrides?.insightsEmpty ? { insights: [] } : insightsResponse;
      return Promise.resolve({ ok: true, json: () => Promise.resolve(ins) });
    }
    if (url.includes("/api/children/child-123")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(childResponse) });
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
  });
}

describe("InsightsPage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should show child name", async () => {
    setupFetch();
    render(<InsightsPage />);
    await waitFor(() => expect(screen.getByText(/for emma/i)).toBeInTheDocument());
  });

  it("should display cached insights", async () => {
    setupFetch();
    render(<InsightsPage />);
    await waitFor(() => {
      expect(screen.getByText(/50th percentile/i)).toBeInTheDocument();
      expect(screen.getByText(/iron-rich/i)).toBeInTheDocument();
      expect(screen.getByText(/climbing/i)).toBeInTheDocument();
      expect(screen.getByText(/vitamin D/i)).toBeInTheDocument();
    });
  });

  it("should show medical disclaimer", async () => {
    setupFetch();
    render(<InsightsPage />);
    await waitFor(() => {
      expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
    });
  });

  it("should show refresh button", async () => {
    setupFetch();
    render(<InsightsPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
    });
  });

  it("should call refresh API when clicked", async () => {
    setupFetch();
    render(<InsightsPage />);
    await waitFor(() => expect(screen.getByText(/for emma/i)).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /refresh/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/children/child-123/insights/refresh`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("should show empty state when no insights exist", async () => {
    setupFetch({ insightsEmpty: true });
    render(<InsightsPage />);
    await waitFor(() => {
      expect(screen.getByText(/no insights yet/i)).toBeInTheDocument();
    });
  });

  it("should navigate back", async () => {
    setupFetch();
    render(<InsightsPage />);
    await waitFor(() => expect(screen.getByText(/50th percentile/i)).toBeInTheDocument());
    await userEvent.click(screen.getByText(/back/i));
    expect(mockPush).toHaveBeenCalledWith("/children/child-123");
  });
});
