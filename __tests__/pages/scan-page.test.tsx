import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScanPage from "@/app/(protected)/children/[id]/scan/page";

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
  },
};

function setupChildFetch() {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes("/api/children/child-123") && !url.includes("/scan")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(childResponse),
      });
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
  });
}

describe("ScanPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupChildFetch();
  });

  it("should show child name in header after loading", async () => {
    render(<ScanPage />);
    await waitFor(() => {
      expect(screen.getByText(/emma/i)).toBeInTheDocument();
    });
  });

  it("should show back button that navigates to child detail", async () => {
    render(<ScanPage />);
    await waitFor(() => {
      expect(screen.getByText(/back/i)).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/back/i));
    expect(mockPush).toHaveBeenCalledWith("/children/child-123");
  });

  it("should show document type selector with two options", async () => {
    render(<ScanPage />);
    await waitFor(() => {
      expect(screen.getByText(/vaccination record/i)).toBeInTheDocument();
      expect(screen.getByText(/u-exam record/i)).toBeInTheDocument();
    });
  });

  it("should show file upload input", async () => {
    render(<ScanPage />);
    await waitFor(() => {
      expect(screen.getByTestId("file-input")).toBeInTheDocument();
    });
  });

  it("should disable scan button when no file is selected", async () => {
    render(<ScanPage />);
    await waitFor(() => {
      const scanBtn = screen.getByRole("button", { name: /scan document/i });
      expect(scanBtn).toBeDisabled();
    });
  });

  it("should show scanning state when scan is submitted", async () => {
    // Never resolve the scan API call
    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (url.includes("/api/children/child-123") && !opts?.method) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(childResponse),
        });
      }
      if (url === "/api/scan") {
        return new Promise(() => {}); // hang
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    render(<ScanPage />);

    await waitFor(() => {
      expect(screen.getByTestId("file-input")).toBeInTheDocument();
    });

    // Simulate file selection
    const file = new File(["fake-image-data"], "test.jpg", { type: "image/jpeg" });
    const fileInput = screen.getByTestId("file-input");
    await userEvent.upload(fileInput, file);

    // Click scan
    const scanBtn = screen.getByRole("button", { name: /scan document/i });
    await userEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText(/scanning/i)).toBeInTheDocument();
    });
  });

  it("should show extracted items after successful scan", async () => {
    const scanResponse = {
      document_type: "vaccination_record",
      confidence: 0.95,
      extracted_items: [
        {
          vaccine_name: "Hexavalent",
          dose_number: 1,
          administered_date: "2024-10-25",
          physician_name: "Dr. Schmidt",
          confidence: 0.92,
        },
        {
          vaccine_name: "Pneumokokken",
          dose_number: 1,
          administered_date: "2024-10-25",
          confidence: 0.88,
        },
      ],
      low_confidence_fields: [],
    };

    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (url.includes("/api/children/child-123") && !opts?.method) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(childResponse),
        });
      }
      if (url === "/api/scan" && opts?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(scanResponse),
        });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    render(<ScanPage />);

    await waitFor(() => {
      expect(screen.getByTestId("file-input")).toBeInTheDocument();
    });

    const file = new File(["fake"], "test.jpg", { type: "image/jpeg" });
    await userEvent.upload(screen.getByTestId("file-input"), file);
    await userEvent.click(screen.getByRole("button", { name: /scan document/i }));

    await waitFor(() => {
      expect(screen.getByText(/hexavalent/i)).toBeInTheDocument();
      expect(screen.getByText(/pneumokokken/i)).toBeInTheDocument();
    });
  });

  it("should show error when scan API fails", async () => {
    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (url.includes("/api/children/child-123") && !opts?.method) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(childResponse),
        });
      }
      if (url === "/api/scan") {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "AI service unavailable" }),
        });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    render(<ScanPage />);

    await waitFor(() => {
      expect(screen.getByTestId("file-input")).toBeInTheDocument();
    });

    const file = new File(["fake"], "test.jpg", { type: "image/jpeg" });
    await userEvent.upload(screen.getByTestId("file-input"), file);
    await userEvent.click(screen.getByRole("button", { name: /scan document/i }));

    await waitFor(() => {
      expect(screen.getByText(/could not scan/i)).toBeInTheDocument();
    });
  });

  it("should confirm items and show success message", async () => {
    const scanResponse = {
      document_type: "vaccination_record",
      confidence: 0.95,
      extracted_items: [
        {
          vaccine_name: "Hexavalent",
          dose_number: 1,
          administered_date: "2024-10-25",
          confidence: 0.92,
        },
      ],
      low_confidence_fields: [],
    };

    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (url.includes("/api/children/child-123") && !opts?.method) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(childResponse),
        });
      }
      if (url === "/api/scan" && opts?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(scanResponse),
        });
      }
      if (url === "/api/scan/confirm" && opts?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ inserted: 1, skipped: 0 }),
        });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    render(<ScanPage />);

    await waitFor(() => {
      expect(screen.getByTestId("file-input")).toBeInTheDocument();
    });

    // Upload and scan
    const file = new File(["fake"], "test.jpg", { type: "image/jpeg" });
    await userEvent.upload(screen.getByTestId("file-input"), file);
    await userEvent.click(screen.getByRole("button", { name: /scan document/i }));

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/hexavalent/i)).toBeInTheDocument();
    });

    // Confirm
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.getByText(/1 item.*added/i)).toBeInTheDocument();
    });
  });
});
