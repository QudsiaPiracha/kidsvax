import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimelineItem } from "@/components/Timeline/TimelineItem";

const baseItem = {
  id: "1",
  name: "U5",
  type: "u_exam" as const,
  status: "upcoming" as const,
  scheduled_date: "2026-06-15",
  details: "Exam at 6-7 months",
  administered_date: null as string | null,
  physician: null as string | null,
};

const baseProps = {
  item: baseItem,
  onMarkComplete: jest.fn(),
};

function renderItem(overrides = {}) {
  return render(
    <TimelineItem {...baseProps} item={{ ...baseItem, ...overrides }} />
  );
}

describe("TimelineItem", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should render sage green badge for completed items", () => {
    renderItem({ status: "completed" });
    const badge = screen.getByTestId("status-badge");
    expect(badge.className).toMatch(/sage|5B8C5A/);
  });

  it("should render amber badge for upcoming items due within 30 days", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 15);
    renderItem({
      status: "upcoming",
      scheduled_date: soon.toISOString().split("T")[0],
    });
    const badge = screen.getByTestId("status-badge");
    expect(badge.className).toMatch(/amber|D4A030/);
  });

  it("should render terracotta badge for overdue items", () => {
    renderItem({ status: "overdue" });
    const badge = screen.getByTestId("status-badge");
    expect(badge.className).toMatch(/terracotta|C45C3E/);
  });

  it("should render gray badge for future scheduled items", () => {
    renderItem({
      status: "scheduled",
      scheduled_date: "2028-01-01",
    });
    const badge = screen.getByTestId("status-badge");
    expect(badge.className).toMatch(/gray/);
  });

  it("should render strikethrough for skipped items", () => {
    renderItem({ status: "skipped" });
    const nameEl = screen.getByText("U5");
    expect(nameEl.className).toMatch(/line-through/);
  });

  it("should expand on tap to show details", async () => {
    renderItem();
    expect(screen.queryByText(/Exam at 6-7 months/)).not.toBeInTheDocument();
    const toggleBtn = screen.getByRole("button", { name: /U5/ });
    await userEvent.click(toggleBtn);
    expect(screen.getByText(/Exam at 6-7 months/)).toBeInTheDocument();
  });

  it("should show 'Mark as completed' button for upcoming/overdue items", async () => {
    renderItem({ status: "upcoming" });
    const toggleBtn = screen.getByRole("button", { name: /U5/ });
    await userEvent.click(toggleBtn);
    expect(
      screen.getByRole("button", { name: /mark as completed/i })
    ).toBeInTheDocument();
  });

  it("should show date administered for completed vaccinations", async () => {
    renderItem({
      status: "completed",
      type: "vaccination",
      administered_date: "2025-06-20",
    });
    const toggleBtn = screen.getByRole("button", { name: /U5/ });
    await userEvent.click(toggleBtn);
    expect(screen.getByText(/20\.06\.2025/)).toBeInTheDocument();
  });

  it("should show physician name for completed items", async () => {
    renderItem({
      status: "completed",
      physician: "Dr. Mueller",
    });
    const toggleBtn = screen.getByRole("button", { name: /U5/ });
    await userEvent.click(toggleBtn);
    expect(screen.getByText(/Dr\. Mueller/)).toBeInTheDocument();
  });
});
