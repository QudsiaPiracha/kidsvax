import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SchedulePage from "@/app/(protected)/children/[id]/schedule/page";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "child-123" }),
  useRouter: () => ({ push: mockPush }),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const childResponse = {
  child: {
    id: "child-123",
    name: "Emma",
    date_of_birth: "2024-08-24",
    gender: "female",
    is_premature: false,
  },
};

const uExamResponse = {
  records: [
    {
      id: "u1-rec",
      status: "completed",
      status_badge: "completed",
      scheduled_date: "2024-08-24",
      completed_date: "2024-08-24",
      physician_name: "Dr. Schmidt",
      u_exams: { name: "U1", description_en: "Initial newborn exam" },
    },
    {
      id: "u2-rec",
      status: "completed",
      status_badge: "completed",
      scheduled_date: "2024-08-29",
      completed_date: "2024-08-29",
      physician_name: "Dr. Schmidt",
      u_exams: { name: "U2", description_en: "Day 3-10 exam" },
    },
    {
      id: "u7-rec",
      status: "upcoming",
      status_badge: "upcoming",
      scheduled_date: "2026-05-24",
      completed_date: null,
      physician_name: null,
      u_exams: { name: "U7", description_en: "21-24 month exam" },
    },
  ],
};

const vaccResponse = {
  records: [
    {
      id: "hex1-rec",
      dose_number: 1,
      status: "administered",
      scheduled_date: "2024-10-24",
      administered_date: "2024-10-25",
      physician_name: "Dr. Schmidt",
      vaccines: { name_en: "Hexavalent", protects_against_en: "Diphtheria, Tetanus, Pertussis" },
    },
    {
      id: "mmr2-rec",
      dose_number: 2,
      status: "overdue",
      scheduled_date: "2025-11-24",
      administered_date: null,
      physician_name: null,
      vaccines: { name_en: "MMR", protects_against_en: "Measles, Mumps, Rubella" },
    },
  ],
};

function setupFetchMock(overrides?: {
  childOk?: boolean;
  uExamsOk?: boolean;
  vaccsOk?: boolean;
}) {
  const { childOk = true, uExamsOk = true, vaccsOk = true } = overrides ?? {};

  mockFetch.mockImplementation((url: string) => {
    if (url.includes("/api/children/child-123/u-exams")) {
      return Promise.resolve({
        ok: uExamsOk,
        json: () => Promise.resolve(uExamsOk ? uExamResponse : { error: "Failed" }),
      });
    }
    if (url.includes("/api/children/child-123/vaccinations")) {
      return Promise.resolve({
        ok: vaccsOk,
        json: () => Promise.resolve(vaccsOk ? vaccResponse : { error: "Failed" }),
      });
    }
    if (url.includes("/api/children/child-123")) {
      return Promise.resolve({
        ok: childOk,
        json: () => Promise.resolve(childOk ? childResponse : { error: "Not found" }),
      });
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
  });
}

describe("SchedulePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show skeleton loader while loading", () => {
    // Never resolve to keep loading state
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<SchedulePage />);
    expect(screen.getByTestId("schedule-skeleton")).toBeInTheDocument();
  });

  it("should show error state when child fetch fails", async () => {
    setupFetchMock({ childOk: false });
    render(<SchedulePage />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it("should show back button that navigates to child detail", async () => {
    setupFetchMock();
    render(<SchedulePage />);
    await waitFor(() => {
      expect(screen.getByText("U1")).toBeInTheDocument();
    });
    const backBtn = screen.getByText(/back/i);
    await userEvent.click(backBtn);
    expect(mockPush).toHaveBeenCalledWith("/children/child-123");
  });

  it("should render u-exam items from API data", async () => {
    setupFetchMock();
    render(<SchedulePage />);
    await waitFor(() => {
      expect(screen.getByText("U1")).toBeInTheDocument();
      expect(screen.getByText("U2")).toBeInTheDocument();
      expect(screen.getByText("U7")).toBeInTheDocument();
    });
  });

  it("should render vaccination items from API data", async () => {
    setupFetchMock();
    render(<SchedulePage />);
    await waitFor(() => {
      expect(screen.getByText("Hexavalent (Dose 1)")).toBeInTheDocument();
      expect(screen.getByText("MMR (Dose 2)")).toBeInTheDocument();
    });
  });

  it("should display items grouped by age phase", async () => {
    setupFetchMock();
    render(<SchedulePage />);
    await waitFor(() => {
      expect(screen.getByText("Newborn")).toBeInTheDocument();
    });
  });

  it("should gracefully handle empty u-exam and vaccination records", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/u-exams")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ records: [] }) });
      }
      if (url.includes("/vaccinations")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ records: [] }) });
      }
      if (url.includes("/api/children/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(childResponse) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    render(<SchedulePage />);
    await waitFor(() => {
      expect(screen.getByText(/no schedule/i)).toBeInTheDocument();
    });
  });

  it("should call mark-complete API when mark-complete button is clicked", async () => {
    setupFetchMock();
    render(<SchedulePage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("MMR (Dose 2)")).toBeInTheDocument();
    });

    // Click on the overdue MMR item to expand it
    const mmrItem = screen.getByText("MMR (Dose 2)");
    await userEvent.click(mmrItem);

    // Click mark as completed
    const markBtn = screen.getByText(/mark as completed/i);

    // Mock the PUT response
    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "PUT") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ record: {} }),
        });
      }
      // Re-fetch after mark complete
      if (url.includes("/u-exams")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(uExamResponse) });
      }
      if (url.includes("/vaccinations")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(vaccResponse) });
      }
      if (url.includes("/api/children/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(childResponse) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    await userEvent.click(markBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/vaccination-records/mmr2-rec",
        expect.objectContaining({ method: "PUT" })
      );
    });
  });
});
