import { AI_MODEL } from "@/lib/ai";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface ScanExtractedItem {
  vaccine_name: string;
  dose_number: number;
  administered_date: string;
  physician_name?: string;
  confidence: number;
}

export interface LowConfidenceField {
  field: string;
  confidence: number;
}

export interface ScanResult {
  document_type: "vaccination_record" | "u_exam_record";
  confidence: number;
  extracted_items: ScanExtractedItem[];
  low_confidence_fields: LowConfidenceField[];
}

interface ExistingRecord {
  vaccine_name: string;
  dose_number: number;
  administered_date: string;
}

// -----------------------------------------------------------------------
// Agent Config
// -----------------------------------------------------------------------

export function createScanAgentConfig(
  imageBase64: string,
  documentType: string,
  existingRecords: ExistingRecord[]
) {
  const systemPrompt = buildScanSystemPrompt(documentType, existingRecords);

  return {
    model: AI_MODEL,
    systemPrompt,
    maxTurns: 3,
    maxBudgetUsd: 0.25,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", data: imageBase64 } },
          { type: "text", text: "Extract all records from this document." },
        ],
      },
    ],
  };
}

function buildScanSystemPrompt(
  documentType: string,
  existingRecords: ExistingRecord[]
): string {
  const existing = existingRecords.length > 0
    ? `\nExisting records (skip duplicates):\n${JSON.stringify(existingRecords)}`
    : "";

  return [
    `You are a German medical document scanner for ${documentType} documents.`,
    "Extract all vaccination or U-exam records as structured JSON.",
    "Return JSON with: document_type, confidence, extracted_items, low_confidence_fields.",
    "Flag any field with confidence below 0.7.",
    existing,
  ].join("\n");
}

// -----------------------------------------------------------------------
// Parse Result
// -----------------------------------------------------------------------

export function parseScanResult(agentOutput: string): ScanResult {
  const parsed = JSON.parse(agentOutput);
  return {
    document_type: parsed.document_type,
    confidence: parsed.confidence,
    extracted_items: parsed.extracted_items ?? [],
    low_confidence_fields: parsed.low_confidence_fields ?? [],
  };
}

// -----------------------------------------------------------------------
// Deduplication
// -----------------------------------------------------------------------

export function deduplicateResults(
  extracted: ScanExtractedItem[],
  existing: ExistingRecord[]
): { newItems: ScanExtractedItem[]; duplicates: ScanExtractedItem[] } {
  const duplicates: ScanExtractedItem[] = [];
  const newItems: ScanExtractedItem[] = [];

  for (const item of extracted) {
    const isDup = existing.some(
      (e) =>
        e.vaccine_name === item.vaccine_name &&
        e.dose_number === item.dose_number &&
        e.administered_date === item.administered_date
    );
    if (isDup) {
      duplicates.push(item);
    } else {
      newItems.push(item);
    }
  }

  return { newItems, duplicates };
}

// -----------------------------------------------------------------------
// Agent Runner (thin wrapper, mocked in tests)
// -----------------------------------------------------------------------

export async function runScanAgent(
  imageBase64: string,
  documentType: string,
  existingRecords: ExistingRecord[]
): Promise<ScanResult> {
  const config = createScanAgentConfig(imageBase64, documentType, existingRecords);
  // In production, this would call: const result = await query(config);
  // For now, return the config shape for testing
  void config;
  throw new Error("runScanAgent requires Claude Agent SDK at runtime");
}
