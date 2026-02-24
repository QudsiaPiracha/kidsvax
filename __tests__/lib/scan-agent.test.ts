import {
  createScanAgentConfig,
  parseScanResult,
  deduplicateResults,
} from "@/lib/agents/scan-agent";

// -----------------------------------------------------------------------
// Scan Agent Config
// -----------------------------------------------------------------------
describe("Scan Agent Config", () => {
  const SAMPLE_IMAGE = "data:image/png;base64,iVBORw0KGgo=";
  const EXISTING_RECORDS = [
    {
      vaccine_name: "MMR",
      dose_number: 1,
      administered_date: "2024-06-15",
    },
  ];

  it("should create agent config with claude-sonnet-4-6 model", () => {
    const config = createScanAgentConfig(
      SAMPLE_IMAGE,
      "vaccination_record",
      []
    );
    expect(config.model).toBe("claude-sonnet-4-6");
  });

  it("should include vision content in the prompt", () => {
    const config = createScanAgentConfig(
      SAMPLE_IMAGE,
      "vaccination_record",
      []
    );
    const messages = config.messages;
    const hasImageContent = messages.some(
      (m: Record<string, unknown>) => {
        const content = m.content;
        if (Array.isArray(content)) {
          return content.some(
            (c: Record<string, unknown>) => c.type === "image"
          );
        }
        return false;
      }
    );
    expect(hasImageContent).toBe(true);
  });

  it("should set maxTurns to prevent runaway agents", () => {
    const config = createScanAgentConfig(
      SAMPLE_IMAGE,
      "vaccination_record",
      []
    );
    expect(config.maxTurns).toBeDefined();
    expect(config.maxTurns).toBeLessThanOrEqual(5);
  });

  it("should return structured extraction result", () => {
    const rawOutput = JSON.stringify({
      document_type: "vaccination_record",
      confidence: 0.92,
      extracted_items: [
        {
          vaccine_name: "MMR",
          dose_number: 1,
          administered_date: "2024-06-15",
          physician_name: "Dr. Mueller",
          confidence: 0.95,
        },
      ],
      low_confidence_fields: [],
    });

    const result = parseScanResult(rawOutput);
    expect(result.document_type).toBe("vaccination_record");
    expect(result.extracted_items).toHaveLength(1);
    expect(result.confidence).toBe(0.92);
  });

  it("should deduplicate against existing records", () => {
    const extracted = [
      {
        vaccine_name: "MMR",
        dose_number: 1,
        administered_date: "2024-06-15",
        physician_name: "Dr. Mueller",
        confidence: 0.95,
      },
      {
        vaccine_name: "Polio",
        dose_number: 1,
        administered_date: "2024-07-01",
        physician_name: "Dr. Schmidt",
        confidence: 0.90,
      },
    ];

    const { newItems, duplicates } = deduplicateResults(
      extracted,
      EXISTING_RECORDS
    );
    expect(newItems).toHaveLength(1);
    expect(newItems[0].vaccine_name).toBe("Polio");
    expect(duplicates).toHaveLength(1);
  });

  it("should flag low-confidence fields", () => {
    const rawOutput = JSON.stringify({
      document_type: "vaccination_record",
      confidence: 0.72,
      extracted_items: [
        {
          vaccine_name: "MMR",
          dose_number: 1,
          administered_date: "2024-06-15",
          physician_name: "Dr. Mueller",
          confidence: 0.55,
        },
      ],
      low_confidence_fields: [
        { field: "physician_name", confidence: 0.55 },
      ],
    });

    const result = parseScanResult(rawOutput);
    expect(result.low_confidence_fields).toHaveLength(1);
    expect(result.low_confidence_fields[0].field).toBe("physician_name");
  });
});
