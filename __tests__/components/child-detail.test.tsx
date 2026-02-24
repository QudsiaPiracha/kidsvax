import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChildDetail } from "@/components/ChildDetail";

const mockBack = jest.fn();

const baseProps = {
  child: {
    id: "child-1",
    name: "Max",
    date_of_birth: "2023-06-15",
    photo_url: null,
  },
  pediatricianName: "Dr. Schmidt",
  nextUpItem: { name: "U7", date: "2026-06-15", type: "u_exam" },
  overdueItems: [] as Array<{ name: string; date: string }>,
  vaccinationStats: { completed: 6, total: 12 },
  examStats: { completed: 4, total: 10 },
  masernCompliance: "compliant" as const,
  recentActivity: [
    { name: "U6", date: "2025-06-15", type: "u_exam" },
    { name: "MMR Dose 1", date: "2025-03-10", type: "vaccination" },
    { name: "Hexavalent Dose 3", date: "2025-01-10", type: "vaccination" },
  ],
  onBack: mockBack,
};

function renderDetail(overrides = {}) {
  return render(<ChildDetail {...baseProps} {...overrides} />);
}

describe("ChildDetail", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should display child name and age in header", () => {
    renderDetail();
    expect(screen.getByText("Max")).toBeInTheDocument();
    expect(screen.getByText(/years|months/)).toBeInTheDocument();
  });

  it("should display Kinderarzt name if assigned", () => {
    renderDetail();
    expect(screen.getByText(/Dr\. Schmidt/)).toBeInTheDocument();
  });

  it("should show 'No pediatrician assigned' if none", () => {
    renderDetail({ pediatricianName: null });
    expect(screen.getByText(/no pediatrician assigned/i)).toBeInTheDocument();
  });

  it("should show next-up card with most imminent item", () => {
    renderDetail();
    expect(screen.getByText("U7")).toBeInTheDocument();
  });

  it("should show next-up as U-exam when it's sooner than vaccination", () => {
    renderDetail({
      nextUpItem: { name: "U7", date: "2026-04-01", type: "u_exam" },
    });
    expect(screen.getByText("U7")).toBeInTheDocument();
  });

  it("should show next-up as vaccination when it's sooner than U-exam", () => {
    renderDetail({
      nextUpItem: { name: "MMR Dose 2", date: "2026-04-01", type: "vaccination" },
    });
    expect(screen.getByText("MMR Dose 2")).toBeInTheDocument();
  });

  it("should show overdue section only when overdue items exist", () => {
    renderDetail({
      overdueItems: [{ name: "Hexavalent Dose 4", date: "2025-01-01" }],
    });
    expect(screen.getByTestId("overdue-section")).toBeInTheDocument();
    expect(screen.getByText("Hexavalent Dose 4")).toBeInTheDocument();
  });

  it("should hide overdue section when no items overdue", () => {
    renderDetail({ overdueItems: [] });
    expect(screen.queryByTestId("overdue-section")).not.toBeInTheDocument();
  });

  it("should show correct vaccination completed count", () => {
    renderDetail();
    expect(screen.getByText(/6 of 12/)).toBeInTheDocument();
  });

  it("should show correct U-exam completed count", () => {
    renderDetail();
    expect(screen.getByText(/4 of 10/)).toBeInTheDocument();
  });

  it("should show Masernschutz compliant indicator when compliant", () => {
    renderDetail({ masernCompliance: "compliant" });
    const el = screen.getByTestId("masern-status");
    expect(el).toHaveTextContent(/compliant/i);
  });

  it("should show Masernschutz non-compliant indicator when not", () => {
    renderDetail({ masernCompliance: "non_compliant" });
    const el = screen.getByTestId("masern-status");
    expect(el).toHaveTextContent(/non-compliant|not compliant/i);
  });

  it("should show last 3 recent activity items", () => {
    renderDetail();
    expect(screen.getByText("U6")).toBeInTheDocument();
    expect(screen.getByText("MMR Dose 1")).toBeInTheDocument();
    expect(screen.getByText("Hexavalent Dose 3")).toBeInTheDocument();
  });

  it("should show empty state for recent activity when nothing completed", () => {
    renderDetail({ recentActivity: [] });
    expect(screen.getByText(/no recent activity/i)).toBeInTheDocument();
  });

  it("should navigate back to dashboard on back button", async () => {
    renderDetail();
    const backBtn = screen.getByRole("button", { name: /back/i });
    await userEvent.click(backBtn);
    expect(mockBack).toHaveBeenCalled();
  });
});
