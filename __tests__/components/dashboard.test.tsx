import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dashboard } from "@/components/Dashboard";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const makeChild = (
  id: string,
  name: string,
  overdueCount = 0,
  dob = "2023-01-01"
) => ({
  child: {
    id,
    name,
    date_of_birth: dob,
    gender: "male",
    photo_url: null,
  },
  nextUpItem: { name: "U5", date: "2026-06-01", type: "u_exam" as const },
  overdueCount,
  vaccinationProgress: { completed: 2, total: 12 },
  examProgress: { completed: 1, total: 10 },
  masernCompliance: "not_yet_required" as const,
});

describe("Dashboard", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should show empty state with 'Add child' button when no children", () => {
    render(<Dashboard children={[]} />);
    expect(screen.getByText(/no children/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add child/i })
    ).toBeInTheDocument();
  });

  it("should render one card per child", () => {
    const children = [makeChild("1", "Max"), makeChild("2", "Lisa")];
    render(<Dashboard children={children} />);
    expect(screen.getByText("Max")).toBeInTheDocument();
    expect(screen.getByText("Lisa")).toBeInTheDocument();
  });

  it("should redirect to child detail when only one child exists", () => {
    const children = [makeChild("child-1", "Max")];
    render(<Dashboard children={children} />);
    expect(mockPush).toHaveBeenCalledWith("/children/child-1");
  });

  it("should order cards by urgency -- overdue children first", () => {
    const children = [
      makeChild("1", "NoOverdue", 0),
      makeChild("2", "HasOverdue", 3),
    ];
    render(<Dashboard children={children} />);
    const cards = screen.getAllByTestId("child-card");
    expect(cards[0]).toHaveTextContent("HasOverdue");
    expect(cards[1]).toHaveTextContent("NoOverdue");
  });

  it("should show 'Add child' button at end of list", () => {
    const children = [makeChild("1", "Max"), makeChild("2", "Lisa")];
    render(<Dashboard children={children} />);
    expect(
      screen.getByRole("button", { name: /add child/i })
    ).toBeInTheDocument();
  });

  it("should navigate to child detail on card tap", async () => {
    const children = [
      makeChild("1", "Max"),
      makeChild("2", "Lisa"),
    ];
    render(<Dashboard children={children} />);
    const cards = screen.getAllByTestId("child-card");
    await userEvent.click(cards[0]);
    expect(mockPush).toHaveBeenCalled();
  });
});
