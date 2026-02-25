import {
  getPercentileCurves,
  getMaxAgeForMeasurement,
  buildChartData,
} from "@/lib/percentile-curves";

describe("getPercentileCurves", () => {
  it("should return 8 data points for weight", () => {
    const curves = getPercentileCurves("male", "weight");
    expect(curves).toHaveLength(8);
  });

  it("should return 6 data points for head circumference", () => {
    const curves = getPercentileCurves("male", "head");
    expect(curves).toHaveLength(6);
  });

  it("should sort by ageMonths ascending", () => {
    const curves = getPercentileCurves("female", "height");
    for (let i = 1; i < curves.length; i++) {
      expect(curves[i].ageMonths).toBeGreaterThan(curves[i - 1].ageMonths);
    }
  });

  it("should include all percentile fields", () => {
    const curves = getPercentileCurves("male", "weight");
    for (const point of curves) {
      expect(point).toHaveProperty("p3");
      expect(point).toHaveProperty("p15");
      expect(point).toHaveProperty("p50");
      expect(point).toHaveProperty("p85");
      expect(point).toHaveProperty("p97");
    }
  });

  it("should return different data for boys vs girls", () => {
    const boys = getPercentileCurves("male", "weight");
    const girls = getPercentileCurves("female", "weight");
    expect(boys[0].p50).not.toEqual(girls[0].p50);
  });
});

describe("getMaxAgeForMeasurement", () => {
  it("should return 36 for head", () => {
    expect(getMaxAgeForMeasurement("head")).toBe(36);
  });

  it("should return 60 for weight", () => {
    expect(getMaxAgeForMeasurement("weight")).toBe(60);
  });

  it("should return 60 for height", () => {
    expect(getMaxAgeForMeasurement("height")).toBe(60);
  });
});

describe("buildChartData", () => {
  const measurements = [
    { measured_date: "2024-08-24", weight_kg: 3.4, height_cm: 50.0, head_circumference_cm: 35.0 },
    { measured_date: "2025-02-20", weight_kg: 7.5, height_cm: 65.0, head_circumference_cm: 42.0 },
  ];

  it("should merge percentile curves with measurement data", () => {
    const data = buildChartData(measurements, "2024-08-24", "female", "weight");
    // Should have curve points + measurement points
    const curvePoints = data.filter((d) => d.p50 != null);
    const valuePoints = data.filter((d) => d.value != null);
    expect(curvePoints.length).toBeGreaterThan(0);
    expect(valuePoints).toHaveLength(2);
  });

  it("should sort by ageMonths", () => {
    const data = buildChartData(measurements, "2024-08-24", "female", "weight");
    for (let i = 1; i < data.length; i++) {
      expect(data[i].ageMonths).toBeGreaterThanOrEqual(data[i - 1].ageMonths);
    }
  });

  it("should skip measurements where metric is null", () => {
    const measWithNull = [
      { measured_date: "2024-08-24", weight_kg: 3.4, height_cm: null, head_circumference_cm: null },
    ];
    const data = buildChartData(measWithNull, "2024-08-24", "male", "height");
    const valuePoints = data.filter((d) => d.value != null);
    expect(valuePoints).toHaveLength(0);
  });

  it("should include percentile for young child measurements", () => {
    const data = buildChartData(measurements, "2024-08-24", "female", "weight");
    const valuePoints = data.filter((d) => d.value != null);
    expect(valuePoints[0].percentile).toBeDefined();
  });

  it("should not include curves for older children", () => {
    const oldMeasurements = [
      { measured_date: "2025-01-15", weight_kg: 50.0, height_cm: 162.0, head_circumference_cm: null },
    ];
    const data = buildChartData(oldMeasurements, "2012-12-10", "female", "weight");
    const curvePoints = data.filter((d) => d.p50 != null);
    expect(curvePoints).toHaveLength(0);
  });
});
