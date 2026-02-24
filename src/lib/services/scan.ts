import {
  scanRequestSchema,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/validations/scan";
import { runScanAgent, deduplicateResults } from "@/lib/agents/scan-agent";
import type { ServiceResult } from "@/lib/services/children";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

interface SupabaseLike {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error: unknown;
    }>;
  };
  from: (table: string) => SupabaseQueryLike;
}

interface SupabaseQueryLike {
  select: (cols?: string) => SupabaseQueryLike;
  insert: (data: Record<string, unknown>) => SupabaseQueryLike;
  eq: (col: string, val: string) => SupabaseQueryLike;
  order: (col: string, opts?: Record<string, boolean>) => Promise<{
    data: Record<string, unknown>[] | null;
    error: { message: string } | null;
  }>;
  single: () => Promise<{
    data: Record<string, unknown> | null;
    error: unknown;
  }>;
}

interface ConfirmVaxInput {
  child_id: string;
  items: Array<{
    vaccine_name: string;
    dose_number: number;
    administered_date: string;
    physician_name?: string;
  }>;
}

interface ConfirmUExamInput {
  child_id: string;
  items: Array<{
    exam_type: string;
    exam_date: string;
    physician_name?: string;
  }>;
}

// -----------------------------------------------------------------------
// Rate Limiting (in-memory per user)
// -----------------------------------------------------------------------

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function estimateBase64Size(base64: string): number {
  const raw = base64.includes(",") ? base64.split(",")[1] : base64;
  return Math.ceil((raw.length * 3) / 4);
}

async function getAuthUserId(sb: SupabaseLike): Promise<string | null> {
  const { data: { user } } = await sb.auth.getUser();
  return user?.id ?? null;
}

async function verifyChildOwnership(
  childId: string,
  sb: SupabaseLike,
  userId: string
): Promise<ServiceResult | null> {
  const { data, error } = await sb
    .from("children").select("*").eq("id", childId).single();
  if (error || !data) return { status: 404, body: { error: "Child not found" } };
  if (data.user_id !== userId) return { status: 403, body: { error: "Forbidden" } };
  return null;
}

// -----------------------------------------------------------------------
// Process Scan
// -----------------------------------------------------------------------

export async function processScan(
  supabase: SupabaseLike,
  input: unknown,
  rateLimitKey?: string
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const key = rateLimitKey ?? userId;
  if (!checkRateLimit(key)) {
    return { status: 429, body: { error: "Rate limit exceeded. Max 10 scans per hour." } };
  }

  const parsed = scanRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 400, body: { error: parsed.error.issues[0].message } };
  }

  if (estimateBase64Size(parsed.data.image) > MAX_IMAGE_SIZE_BYTES) {
    return { status: 400, body: { error: "Image exceeds 2MB limit" } };
  }

  const result = await runScanAgent(parsed.data.image, parsed.data.document_type, []);
  return { status: 200, body: { ...result } };
}

// -----------------------------------------------------------------------
// Confirm Vaccinations
// -----------------------------------------------------------------------

export async function confirmScanVaccinations(
  supabase: SupabaseLike,
  input: ConfirmVaxInput
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const ownerErr = await verifyChildOwnership(input.child_id, supabase, userId);
  if (ownerErr) return ownerErr;

  const { data: existing } = await supabase
    .from("vaccination_records").select("*")
    .eq("child_id", input.child_id)
    .order("administered_date", { ascending: true });

  const existingRecords = (existing ?? []).map((r) => ({
    vaccine_name: r.vaccine_name as string,
    dose_number: r.dose_number as number,
    administered_date: r.administered_date as string,
  }));

  const { newItems, duplicates, conflicts } = classifyItems(input.items, existingRecords);

  if (conflicts.length > 0) {
    return { status: 200, body: { conflicts, skipped: duplicates.length, inserted: 0 } };
  }
  if (newItems.length === 0) {
    return { status: 200, body: { skipped: duplicates.length, inserted: 0 } };
  }

  for (const item of newItems) {
    await supabase.from("vaccination_records")
      .insert({ child_id: input.child_id, ...item } as Record<string, unknown>)
      .select().single();
  }

  return { status: 201, body: { inserted: newItems.length, skipped: duplicates.length } };
}

// -----------------------------------------------------------------------
// Confirm U-Exams
// -----------------------------------------------------------------------

export async function confirmScanUExams(
  supabase: SupabaseLike,
  input: ConfirmUExamInput
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const ownerErr = await verifyChildOwnership(input.child_id, supabase, userId);
  if (ownerErr) return ownerErr;

  const { data: existing } = await supabase
    .from("u_exam_records").select("*")
    .eq("child_id", input.child_id)
    .order("exam_date", { ascending: true });

  const existingTypes = new Set((existing ?? []).map((r) => r.exam_type as string));
  const newItems = input.items.filter((i) => !existingTypes.has(i.exam_type));

  for (const item of newItems) {
    await supabase.from("u_exam_records")
      .insert({ child_id: input.child_id, ...item } as Record<string, unknown>)
      .select().single();
  }

  return {
    status: 201,
    body: { inserted: newItems.length, skipped: input.items.length - newItems.length },
  };
}

// -----------------------------------------------------------------------
// Classification
// -----------------------------------------------------------------------

interface ClassifiedItems {
  newItems: ConfirmVaxInput["items"];
  duplicates: ConfirmVaxInput["items"];
  conflicts: Array<{
    incoming: ConfirmVaxInput["items"][0];
    existing: { vaccine_name: string; dose_number: number; administered_date: string };
  }>;
}

function classifyItems(
  incoming: ConfirmVaxInput["items"],
  existing: Array<{ vaccine_name: string; dose_number: number; administered_date: string }>
): ClassifiedItems {
  const result: ClassifiedItems = { newItems: [], duplicates: [], conflicts: [] };

  for (const item of incoming) {
    const match = existing.find(
      (e) => e.vaccine_name === item.vaccine_name && e.dose_number === item.dose_number
    );
    if (!match) {
      result.newItems.push(item);
    } else if (match.administered_date === item.administered_date) {
      result.duplicates.push(item);
    } else {
      result.conflicts.push({ incoming: item, existing: match });
    }
  }

  return result;
}
