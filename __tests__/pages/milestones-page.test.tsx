import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MilestonesPage from "@/app/(protected)/children/[id]/milestones/page";

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

const milestonesResponse = {
  milestones: {
    U3: [
      {
        id: "mr-1", child_id: "child-123", milestone_id: "ms-1",
        achieved: true, observed_date: "2024-10-15",
        milestone: { id: "ms-1", u_exam: "U3", category: "motor", title_en: "Lifts head when on tummy", title_de: "Hebt den Kopf in Bauchlage" },
      },
      {
        id: "mr-2", child_id: "child-123", milestone_id: "ms-2",
        achieved: false, observed_date: null,
        milestone: { id: "ms-2", u_exam: "U3", category: "language", title_en: "Coos and makes sounds", title_de: "Gurrt und macht Laute" },
      },
    ],
    U6: [
      {
        id: "mr-3", child_id: "child-123", milestone_id: "ms-3",
        achieved: false, observed_date: null,
        milestone: { id: "ms-3", u_exam: "U6", category: "motor", title_en: "Sits without support", title_de: "Sitzt ohne Hilfe" },
      },
    ],
  },
};

function setupFetch() {
  mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
    if (opts?.method === "PUT" && url.includes("/milestone-records/")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ record: {} }) });
    }
    if (url.includes("/milestones")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(milestonesResponse) });
    }
    if (url.includes("/api/children/child-123")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(childResponse) });
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
  });
}

describe("MilestonesPage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should show child name", async () => {
    setupFetch();
    render(<MilestonesPage />);
    await waitFor(() => expect(screen.getByText(/emma/i)).toBeInTheDocument());
  });

  it("should group milestones by U-exam", async () => {
    setupFetch();
    render(<MilestonesPage />);
    await waitFor(() => {
      expect(screen.getByText("U3")).toBeInTheDocument();
      expect(screen.getByText("U6")).toBeInTheDocument();
    });
  });

  it("should show milestone titles", async () => {
    setupFetch();
    render(<MilestonesPage />);
    await waitFor(() => {
      expect(screen.getByText(/lifts head/i)).toBeInTheDocument();
      expect(screen.getByText(/coos and makes sounds/i)).toBeInTheDocument();
      expect(screen.getByText(/sits without support/i)).toBeInTheDocument();
    });
  });

  it("should show achieved checkboxes", async () => {
    setupFetch();
    render(<MilestonesPage />);
    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBe(3);
      expect(checkboxes[0]).toBeChecked(); // Lifts head - achieved
      expect(checkboxes[1]).not.toBeChecked(); // Coos - not achieved
    });
  });

  it("should toggle milestone when checkbox clicked", async () => {
    setupFetch();
    render(<MilestonesPage />);
    await waitFor(() => expect(screen.getByText(/coos/i)).toBeInTheDocument());

    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[1]); // Toggle "Coos and makes sounds"

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/milestone-records/mr-2",
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  it("should show progress count per group", async () => {
    setupFetch();
    render(<MilestonesPage />);
    await waitFor(() => {
      expect(screen.getByText("1 / 2")).toBeInTheDocument(); // U3: 1 of 2
      expect(screen.getByText("0 / 1")).toBeInTheDocument(); // U6: 0 of 1
    });
  });

  it("should navigate back", async () => {
    setupFetch();
    render(<MilestonesPage />);
    await waitFor(() => expect(screen.getByText(/emma/i)).toBeInTheDocument());
    await userEvent.click(screen.getByText(/back/i));
    expect(mockPush).toHaveBeenCalledWith("/children/child-123");
  });
});
