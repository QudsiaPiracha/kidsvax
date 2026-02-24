import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Timeline } from "@/components/Timeline";

const baseItems = [
  {
    id: "1",
    name: "U1",
    type: "u_exam" as const,
    status: "completed" as const,
    scheduled_date: "2023-06-15",
    age_group: "Newborn",
    details: "Initial exam",
    administered_date: "2023-06-15",
    physician: "Dr. Schmidt",
  },
  {
    id: "2",
    name: "U2",
    type: "u_exam" as const,
    status: "completed" as const,
    scheduled_date: "2023-06-22",
    age_group: "Newborn",
    details: "3-10 day exam",
    administered_date: "2023-06-22",
    physician: "Dr. Schmidt",
  },
  {
    id: "3",
    name: "U3",
    type: "u_exam" as const,
    status: "completed" as const,
    scheduled_date: "2023-08-15",
    age_group: "2-4 months",
    details: "4-5 week exam",
    administered_date: null,
    physician: null,
  },
  {
    id: "4",
    name: "U4",
    type: "u_exam" as const,
    status: "upcoming" as const,
    scheduled_date: "2023-10-15",
    age_group: "2-4 months",
    details: "3-4 month exam",
    administered_date: null,
    physician: null,
  },
  {
    id: "5",
    name: "Hexavalent Dose 1",
    type: "vaccination" as const,
    status: "upcoming" as const,
    scheduled_date: "2023-08-20",
    age_group: "2-4 months",
    details: "First hexavalent dose",
    administered_date: null,
    physician: null,
  },
];

const baseProps = {
  items: baseItems,
  childName: "Max",
  children: undefined as
    | Array<{ id: string; name: string }>
    | undefined,
  onChildSelect: jest.fn(),
  onMarkComplete: jest.fn(),
};

describe("Timeline", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should group items by age phase", () => {
    render(<Timeline {...baseProps} />);
    expect(screen.getByText("Newborn")).toBeInTheDocument();
    expect(screen.getByText("2-4 months")).toBeInTheDocument();
  });

  it("should show 'Newborn' group with U1, U2", () => {
    render(<Timeline {...baseProps} />);
    expect(screen.getByText("U1")).toBeInTheDocument();
    expect(screen.getByText("U2")).toBeInTheDocument();
  });

  it("should show '2-4 months' group with U3, U4, and first vaccinations", () => {
    render(<Timeline {...baseProps} />);
    expect(screen.getByText("U3")).toBeInTheDocument();
    expect(screen.getByText("U4")).toBeInTheDocument();
    expect(screen.getByText("Hexavalent Dose 1")).toBeInTheDocument();
  });

  it("should order items within groups by scheduled_date", () => {
    render(<Timeline {...baseProps} />);
    const items = screen.getAllByTestId("timeline-item");
    const names = items.map((el) => el.textContent);
    const u3Index = names.findIndex((t) => t?.includes("U3"));
    const hexIndex = names.findIndex((t) => t?.includes("Hexavalent"));
    const u4Index = names.findIndex((t) => t?.includes("U4"));
    expect(u3Index).toBeLessThan(hexIndex);
    expect(hexIndex).toBeLessThan(u4Index);
  });

  it("should show child selector when multiple children exist", () => {
    render(
      <Timeline
        {...baseProps}
        children={[
          { id: "1", name: "Max" },
          { id: "2", name: "Lisa" },
        ]}
      />
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should toggle between list and calendar view", async () => {
    render(<Timeline {...baseProps} />);
    const toggleBtn = screen.getByRole("button", { name: /calendar/i });
    expect(toggleBtn).toBeInTheDocument();
    await userEvent.click(toggleBtn);
    expect(
      screen.getByRole("button", { name: /list/i })
    ).toBeInTheDocument();
  });
});
