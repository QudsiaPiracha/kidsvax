import React from "react";
import { render, screen } from "@testing-library/react";
import { ChildCard } from "@/components/ChildCard";

const baseChild = {
  id: "child-1",
  name: "Max",
  date_of_birth: "2024-06-15",
  gender: "male",
  photo_url: null,
};

const baseProps = {
  child: baseChild,
  nextUpItem: { name: "U5", date: "2026-03-15", type: "u_exam" as const },
  overdueCount: 0,
  vaccinationProgress: { completed: 4, total: 12 },
  examProgress: { completed: 3, total: 10 },
  masernCompliance: "not_yet_required" as const,
  onClick: jest.fn(),
};

function renderCard(overrides = {}) {
  return render(<ChildCard {...baseProps} {...overrides} />);
}

describe("ChildCard", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should display child name and calculated age", () => {
    renderCard();
    expect(screen.getByText("Max")).toBeInTheDocument();
    expect(screen.getByText(/months|years/)).toBeInTheDocument();
  });

  it("should display age as 'X months' for children under 2 years", () => {
    renderCard({
      child: { ...baseChild, date_of_birth: "2025-06-15" },
    });
    expect(screen.getByText(/months/)).toBeInTheDocument();
  });

  it("should display age as 'X years' for children 2+", () => {
    renderCard({
      child: { ...baseChild, date_of_birth: "2022-01-01" },
    });
    expect(screen.getByText(/years/)).toBeInTheDocument();
  });

  it("should display child photo if available", () => {
    renderCard({
      child: { ...baseChild, photo_url: "https://example.com/photo.jpg" },
    });
    const img = screen.getByAltText("Max");
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
  });

  it("should display default avatar if no photo", () => {
    renderCard();
    expect(screen.getByTestId("default-avatar")).toBeInTheDocument();
  });

  it("should show next upcoming item name and date", () => {
    renderCard();
    expect(screen.getByText("U5")).toBeInTheDocument();
    expect(screen.getByText(/15\.03\.2026/)).toBeInTheDocument();
  });

  it("should show countdown in days if < 30 days away", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 10);
    const dateStr = soon.toISOString().split("T")[0];
    renderCard({
      nextUpItem: { name: "U5", date: dateStr, type: "u_exam" },
    });
    expect(screen.getByText(/\d+ days/)).toBeInTheDocument();
  });

  it("should show countdown in weeks if 30-90 days away", () => {
    const later = new Date();
    later.setDate(later.getDate() + 45);
    const dateStr = later.toISOString().split("T")[0];
    renderCard({
      nextUpItem: { name: "U5", date: dateStr, type: "u_exam" },
    });
    expect(screen.getByText(/\d+ weeks/)).toBeInTheDocument();
  });

  it("should show overdue count with terracotta styling when items are overdue", () => {
    renderCard({ overdueCount: 3 });
    const badge = screen.getByText(/3 overdue/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/terracotta|C45C3E/);
  });

  it("should not show overdue section when no items are overdue", () => {
    renderCard({ overdueCount: 0 });
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });

  it("should show vaccination progress as 'X of Y'", () => {
    renderCard();
    expect(screen.getByText(/4 of 12/)).toBeInTheDocument();
  });

  it("should show U-exam progress as 'X of Y'", () => {
    renderCard();
    expect(screen.getByText(/3 of 10/)).toBeInTheDocument();
  });

  it("should show Masernschutz compliance icon", () => {
    renderCard({ masernCompliance: "compliant" });
    expect(screen.getByTestId("masern-status")).toBeInTheDocument();
  });
});
