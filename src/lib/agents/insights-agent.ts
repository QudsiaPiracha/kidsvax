import { AI_MODEL, DEFAULT_AGENT_OPTIONS } from "@/lib/ai";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface AnonymizedChildData {
  age_months: number;
  gender: "male" | "female";
  measurements: AnonymizedMeasurement[];
  milestones: AnonymizedMilestone[];
}

interface AnonymizedMeasurement {
  height_cm: number;
  weight_kg: number;
  measured_date: string;
}

interface AnonymizedMilestone {
  name: string;
  achieved_date: string;
}

export interface InsightsResult {
  trend_summary: string;
  dietary_suggestions: string[];
  doctor_questions: string[];
  disclaimer: string;
}

interface ChildRecord {
  first_name?: string;
  last_name?: string;
  date_of_birth: string;
  gender: "male" | "female";
}

interface MeasurementRecord {
  height_cm: number;
  weight_kg: number;
  measured_date: string;
}

interface MilestoneRecord {
  name: string;
  achieved_date: string;
}

// -----------------------------------------------------------------------
// Anonymize
// -----------------------------------------------------------------------

export function anonymizeChildData(
  child: ChildRecord,
  measurements: MeasurementRecord[],
  milestones: MilestoneRecord[]
): AnonymizedChildData {
  const ageMonths = calculateAgeInMonths(child.date_of_birth);

  return {
    age_months: ageMonths,
    gender: child.gender,
    measurements: measurements.map((m) => ({
      height_cm: m.height_cm,
      weight_kg: m.weight_kg,
      measured_date: m.measured_date,
    })),
    milestones: milestones.map((m) => ({
      name: m.name,
      achieved_date: m.achieved_date,
    })),
  };
}

function calculateAgeInMonths(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  return Math.max(0, months);
}

// -----------------------------------------------------------------------
// Agent Config
// -----------------------------------------------------------------------

export function createInsightsAgentConfig(childData: AnonymizedChildData) {
  const systemPrompt = buildInsightsSystemPrompt();
  const userMessage = buildInsightsUserMessage(childData);

  return {
    model: AI_MODEL,
    systemPrompt,
    maxTurns: DEFAULT_AGENT_OPTIONS.maxTurns,
    maxBudgetUsd: DEFAULT_AGENT_OPTIONS.maxBudgetUsd,
    messages: [{ role: "user", content: userMessage }],
  };
}

function buildInsightsSystemPrompt(): string {
  return [
    "You are a pediatric health insights assistant for German families.",
    "Follow STIKO vaccination guidelines and G-BA U-exam standards.",
    "Provide personalized growth trend analysis, dietary suggestions,",
    "and questions parents can ask their pediatrician.",
    "Always include disclaimer: 'General guidance, not medical advice.'",
    "Never diagnose, prescribe, or contradict official guidelines.",
    "Return structured JSON with: trend_summary, dietary_suggestions,",
    "doctor_questions, disclaimer.",
  ].join("\n");
}

function buildInsightsUserMessage(childData: AnonymizedChildData): string {
  return [
    `Child: ${childData.age_months} months old, ${childData.gender}.`,
    `Measurements: ${JSON.stringify(childData.measurements)}`,
    `Milestones: ${JSON.stringify(childData.milestones)}`,
    "Generate personalized growth insights.",
  ].join("\n");
}

// -----------------------------------------------------------------------
// Parse Result
// -----------------------------------------------------------------------

export function parseInsightsResult(agentOutput: string): InsightsResult {
  const parsed = JSON.parse(agentOutput);
  return {
    trend_summary: parsed.trend_summary ?? "",
    dietary_suggestions: parsed.dietary_suggestions ?? [],
    doctor_questions: parsed.doctor_questions ?? [],
    disclaimer: parsed.disclaimer ?? "General guidance, not medical advice.",
  };
}

// -----------------------------------------------------------------------
// Agent Runner (thin wrapper, mocked in tests)
// -----------------------------------------------------------------------

export async function runInsightsAgent(
  childData: AnonymizedChildData
): Promise<InsightsResult> {
  const config = createInsightsAgentConfig(childData);
  void config;
  throw new Error("runInsightsAgent requires Claude Agent SDK at runtime");
}
