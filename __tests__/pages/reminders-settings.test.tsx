import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReminderSettings } from "@/components/ReminderSettings";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const prefsResponse = {
  preferences: {
    user_id: "user-1",
    u_exam_reminders: true,
    vaccination_reminders: true,
    reminder_days_before_u_exam: 14,
    reminder_days_before_vaccination: 7,
  },
};

function setupFetch() {
  mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
    if (opts?.method === "PUT" && url === "/api/reminders") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(prefsResponse) });
    }
    if (url === "/api/reminders") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(prefsResponse) });
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
  });
}

describe("ReminderSettings", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should load and display current preferences", async () => {
    setupFetch();
    render(<ReminderSettings />);
    await waitFor(() => {
      expect(screen.getByLabelText(/u-exam reminders/i)).toBeChecked();
      expect(screen.getByLabelText(/vaccination reminders/i)).toBeChecked();
    });
  });

  it("should show days-before inputs", async () => {
    setupFetch();
    render(<ReminderSettings />);
    await waitFor(() => {
      expect(screen.getByLabelText(/days before u-exam/i)).toHaveValue(14);
      expect(screen.getByLabelText(/days before vaccination/i)).toHaveValue(7);
    });
  });

  it("should save preferences when save button clicked", async () => {
    setupFetch();
    render(<ReminderSettings />);
    await waitFor(() => expect(screen.getByLabelText(/u-exam reminders/i)).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/reminders",
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  it("should show success message after save", async () => {
    setupFetch();
    render(<ReminderSettings />);
    await waitFor(() => expect(screen.getByLabelText(/u-exam reminders/i)).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });
  });

  it("should toggle u-exam reminders", async () => {
    setupFetch();
    render(<ReminderSettings />);
    await waitFor(() => expect(screen.getByLabelText(/u-exam reminders/i)).toBeChecked());
    await userEvent.click(screen.getByLabelText(/u-exam reminders/i));
    expect(screen.getByLabelText(/u-exam reminders/i)).not.toBeChecked();
  });
});
