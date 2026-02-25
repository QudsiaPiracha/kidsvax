import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GrowthChart } from "@/components/GrowthChart";

// Mock Recharts - JSDOM doesn't support SVG rendering
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

const youngChildMeasurements = [
  { id: "m1", measured_date: "2024-08-24", weight_kg: 3.4, height_cm: 50.0, head_circumference_cm: 35.0, bmi: 13.6 },
  { id: "m2", measured_date: "2025-02-20", weight_kg: 7.5, height_cm: 65.0, head_circumference_cm: 42.0, bmi: 17.8 },
  { id: "m3", measured_date: "2026-01-15", weight_kg: 10.2, height_cm: 79.0, head_circumference_cm: 46.0, bmi: 16.3 },
];

const oldChildMeasurements = [
  { id: "m1", measured_date: "2025-01-15", weight_kg: 50.0, height_cm: 162.0, head_circumference_cm: null, bmi: 19.1 },
];

describe("GrowthChart", () => {
  it("should render chart container", () => {
    render(
      <GrowthChart
        measurements={youngChildMeasurements}
        gender="female"
        dateOfBirth="2024-08-24"
      />
    );
    expect(screen.getByTestId("growth-chart")).toBeInTheDocument();
  });

  it("should render weight tab as active by default", () => {
    render(
      <GrowthChart
        measurements={youngChildMeasurements}
        gender="female"
        dateOfBirth="2024-08-24"
      />
    );
    const weightTab = screen.getByTestId("tab-weight");
    expect(weightTab).toHaveClass("bg-sage-500");
  });

  it("should render height tab", () => {
    render(
      <GrowthChart
        measurements={youngChildMeasurements}
        gender="female"
        dateOfBirth="2024-08-24"
      />
    );
    expect(screen.getByTestId("tab-height")).toBeInTheDocument();
  });

  it("should render head tab for young child", () => {
    render(
      <GrowthChart
        measurements={youngChildMeasurements}
        gender="female"
        dateOfBirth="2024-08-24"
      />
    );
    expect(screen.getByTestId("tab-head")).toBeInTheDocument();
  });

  it("should NOT render head tab for older child", () => {
    render(
      <GrowthChart
        measurements={oldChildMeasurements}
        gender="female"
        dateOfBirth="2012-12-10"
      />
    );
    expect(screen.queryByTestId("tab-head")).not.toBeInTheDocument();
  });

  it("should switch tabs when clicked", async () => {
    render(
      <GrowthChart
        measurements={youngChildMeasurements}
        gender="female"
        dateOfBirth="2024-08-24"
      />
    );
    const heightTab = screen.getByTestId("tab-height");
    await userEvent.click(heightTab);
    expect(heightTab).toHaveClass("bg-sage-500");
  });

  it("should show no-percentile note for older children", () => {
    render(
      <GrowthChart
        measurements={oldChildMeasurements}
        gender="female"
        dateOfBirth="2012-12-10"
      />
    );
    expect(screen.getByTestId("no-percentile-note")).toBeInTheDocument();
  });

  it("should show legend for young children with percentile bands", () => {
    render(
      <GrowthChart
        measurements={youngChildMeasurements}
        gender="female"
        dateOfBirth="2024-08-24"
      />
    );
    expect(screen.getByText(/healthy/i)).toBeInTheDocument();
    expect(screen.getByText(/monitor/i)).toBeInTheDocument();
    expect(screen.getByText(/concern/i)).toBeInTheDocument();
  });

  it("should show empty metric message when no data for selected tab", async () => {
    const weightOnlyMeasurements = [
      { id: "m1", measured_date: "2024-08-24", weight_kg: 3.4, height_cm: null, head_circumference_cm: null, bmi: null },
    ];
    render(
      <GrowthChart
        measurements={weightOnlyMeasurements}
        gender="female"
        dateOfBirth="2024-08-24"
      />
    );
    // Switch to height tab
    await userEvent.click(screen.getByTestId("tab-height"));
    expect(screen.getByText(/no height data/i)).toBeInTheDocument();
  });

  it("should render responsive container", () => {
    render(
      <GrowthChart
        measurements={youngChildMeasurements}
        gender="female"
        dateOfBirth="2024-08-24"
      />
    );
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });
});
