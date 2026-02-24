import {
  createMeasurementSchema,
  updateMeasurementSchema,
} from "@/lib/validations/growth";
import { calculateBMI } from "@/lib/percentile";

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
  update: (data: Record<string, unknown>) => SupabaseQueryLike;
  delete: () => SupabaseQueryLike;
  eq: (col: string, val: string) => SupabaseQueryLike;
  order: (col: string, opts?: Record<string, boolean>) => Promise<{
    data: unknown;
    error: { message: string } | null;
  }>;
  single: () => Promise<{
    data: Record<string, unknown> | null;
    error: unknown;
  }>;
}

export interface ServiceResult {
  status: number;
  body?: Record<string, unknown> | null;
}

async function getAuthUserId(
  supabase: SupabaseLike
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function verifyChildOwnership(
  childId: string,
  supabase: SupabaseLike,
  userId: string
): Promise<ServiceResult | null> {
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .single();

  if (error || !data) {
    return { status: 404, body: { error: "Child not found" } };
  }
  if (data.user_id !== userId) {
    return { status: 403, body: { error: "Forbidden" } };
  }
  return null;
}

function computeBMI(
  input: Record<string, unknown>
): number | undefined {
  const h = input.height_cm as number | undefined;
  const w = input.weight_kg as number | undefined;
  if (h && w && h > 0 && w > 0) {
    return calculateBMI(h, w);
  }
  return undefined;
}

export async function createMeasurement(
  childId: string,
  supabase: SupabaseLike,
  input: unknown
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const parsed = createMeasurementSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 400, body: { error: parsed.error.issues[0].message } };
  }

  const ownerError = await verifyChildOwnership(childId, supabase, userId);
  if (ownerError) return ownerError;

  const today = new Date().toISOString().split("T")[0];
  const bmi = computeBMI(parsed.data as Record<string, unknown>);
  const row: Record<string, unknown> = {
    ...parsed.data,
    child_id: childId,
    measured_date: parsed.data.measured_date ?? today,
  };
  if (bmi !== undefined) row.bmi = bmi;

  const { data, error } = await supabase
    .from("growth_measurements")
    .insert(row)
    .select()
    .single();

  if (error) {
    return {
      status: 500,
      body: { error: (error as { message: string }).message },
    };
  }
  return { status: 201, body: { measurement: data } };
}

export async function listMeasurements(
  childId: string,
  supabase: SupabaseLike
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const ownerError = await verifyChildOwnership(childId, supabase, userId);
  if (ownerError) return ownerError;

  const { data, error } = await supabase
    .from("growth_measurements")
    .select("*")
    .eq("child_id", childId)
    .order("measured_date", { ascending: true });

  if (error) {
    return { status: 500, body: { error: error.message } };
  }
  return { status: 200, body: { measurements: data ?? [] } };
}

export async function updateMeasurement(
  id: string,
  supabase: SupabaseLike,
  input: unknown
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const { data: existing, error: fetchErr } = await supabase
    .from("growth_measurements")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !existing) {
    return { status: 404, body: { error: "Measurement not found" } };
  }

  const ownerError = await verifyChildOwnership(
    existing.child_id as string,
    supabase,
    userId
  );
  if (ownerError) return ownerError;

  const parsed = updateMeasurementSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 400, body: { error: parsed.error.issues[0].message } };
  }

  const merged = { ...existing, ...parsed.data };
  const bmi = computeBMI(merged as Record<string, unknown>);
  const updates: Record<string, unknown> = { ...parsed.data };
  if (bmi !== undefined) updates.bmi = bmi;

  const { data, error } = await supabase
    .from("growth_measurements")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return {
      status: 500,
      body: { error: (error as { message: string }).message },
    };
  }
  return { status: 200, body: { measurement: data } };
}

export async function deleteMeasurement(
  id: string,
  supabase: SupabaseLike
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const { data: existing, error: fetchErr } = await supabase
    .from("growth_measurements")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !existing) {
    return { status: 404, body: { error: "Measurement not found" } };
  }

  const ownerError = await verifyChildOwnership(
    existing.child_id as string,
    supabase,
    userId
  );
  if (ownerError) return ownerError;

  const deleteQuery = supabase
    .from("growth_measurements")
    .delete()
    .eq("id", id);
  const { error } = await (deleteQuery as unknown as Promise<{
    error: { message: string } | null;
  }>);

  if (error) {
    return { status: 500, body: { error: error.message } };
  }
  return { status: 204 };
}
