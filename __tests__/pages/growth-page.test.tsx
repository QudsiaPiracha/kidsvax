import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GrowthPage from "@/app/(protected)/children/[id]/growth/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "child-123" }),
  useRouter: () => ({ push: mockPush }),
}));

// Mock Recharts for JSDOM
jest.mock("recharts", () => {
  const Original = jest.requireActual("recharts");
  return {
    ...Original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 400, height: 280 }}>
        {children}
      </div>
    ),
  };
});

const mockFetch = jest.fn();
global.fetch = mockFetch;

const childResponse = {
  child: { id: "child-123", name: "Emma", date_of_birth: "2024-08-24", gender: "female" },
};

const measurementsResponse = {
  measurements: [
    { id: "m1", measured_date: "2024-08-24", weight_kg: 3.4, height_cm: 50.0, head_circumference_cm: 35.0, bmi: 13.6 },
    { id: "m2", measured_date: "2025-02-20", weight_kg: 7.5, height_cm: 65.0, head_circumference_cm: 42.0, bmi: 17.8 },
    { id: "m3", measured_date: "2026-01-15", weight_kg: 10.2, height_cm: 79.0, head_circumference_cm: 46.0, bmi: 16.3 },
  ],
};

function setupFetch(overrides?: { childOk?: boolean; growthOk?: boolean }) {
  const { childOk = true, growthOk = true } = overrides ?? {};
  mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
    if (opts?.method === "POST" && url.includes("/growth")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ measurement: { id: "new" } }) });
    }
    if (url.includes("/api/children/child-123/growth")) {
      return Promise.resolve({ ok: growthOk, json: () => Promise.resolve(growthOk ? measurementsResponse : {}) });
    }
    if (url.includes("/api/children/child-123")) {
      return Promise.resolve({ ok: childOk, json: () => Promise.resolve(childOk ? childResponse : {}) });
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
  });
}

describe("GrowthPage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should show skeleton while loading", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<GrowthPage />);
    expect(screen.getByTestId("growth-skeleton")).toBeInTheDocument();
  });

  it("should show child name after loading", async () => {
    setupFetch();
    render(<GrowthPage />);
    await waitFor(() => expect(screen.getByText(/emma/i)).toBeInTheDocument());
  });

  it("should render measurement rows", async () => {
    setupFetch();
    render(<GrowthPage />);
    await waitFor(() => {
      expect(screen.getByText(/3\.4/)).toBeInTheDocument();
      expect(screen.getByText(/50/)).toBeInTheDocument();
      expect(screen.getByText(/10\.2/)).toBeInTheDocument();
    });
  });

  it("should show add measurement form when button clicked", async () => {
    setupFetch();
    render(<GrowthPage />);
    await waitFor(() => expect(screen.getByText(/emma/i)).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /add measurement/i }));
    expect(screen.getByLabelText(/weight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
  });

  it("should submit new measurement and refresh", async () => {
    setupFetch();
    render(<GrowthPage />);
    await waitFor(() => expect(screen.getByText(/emma/i)).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /add measurement/i }));

    await userEvent.type(screen.getByLabelText(/weight/i), "11.0");
    await userEvent.type(screen.getByLabelText(/height/i), "82.0");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/children/child-123/growth",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("should show back button", async () => {
    setupFetch();
    render(<GrowthPage />);
    await waitFor(() => expect(screen.getByText(/emma/i)).toBeInTheDocument());
    await userEvent.click(screen.getByText(/back/i));
    expect(mockPush).toHaveBeenCalledWith("/children/child-123");
  });

  it("should show empty state when no measurements", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/growth")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ measurements: [] }) });
      if (url.includes("/api/children/")) return Promise.resolve({ ok: true, json: () => Promise.resolve(childResponse) });
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });
    render(<GrowthPage />);
    await waitFor(() => expect(screen.getByText(/no measurements/i)).toBeInTheDocument());
  });

  it("should render growth chart when measurements exist", async () => {
    setupFetch();
    render(<GrowthPage />);
    await waitFor(() => expect(screen.getByTestId("growth-chart")).toBeInTheDocument());
  });

  it("should NOT render growth chart when no measurements", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/growth")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ measurements: [] }) });
      if (url.includes("/api/children/")) return Promise.resolve({ ok: true, json: () => Promise.resolve(childResponse) });
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });
    render(<GrowthPage />);
    await waitFor(() => expect(screen.getByText(/no measurements/i)).toBeInTheDocument());
    expect(screen.queryByTestId("growth-chart")).not.toBeInTheDocument();
  });
});
