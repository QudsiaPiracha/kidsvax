import { createChildSchema, updateChildSchema } from "@/lib/validations/child";

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
  single: () => Promise<{ data: Record<string, unknown> | null; error: unknown }>;
  then?: (
    resolve: (val: { data: unknown; error: unknown }) => void
  ) => void;
}

export interface ServiceResult {
  status: number;
  body?: Record<string, unknown> | null;
}

async function getAuthUserId(
  supabase: SupabaseLike
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function listChildren(
  supabase: SupabaseLike
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const query = supabase.from("children").select("*").eq("user_id", userId);
  const { data, error } = await (query as unknown as Promise<{
    data: unknown;
    error: { message: string } | null;
  }>);

  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { children: data ?? [] } };
}

export async function createChild(
  supabase: SupabaseLike,
  input: unknown
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const parsed = createChildSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 400, body: { error: parsed.error.issues[0].message } };
  }

  const { data, error } = await supabase
    .from("children")
    .insert({ ...parsed.data, user_id: userId })
    .select()
    .single();

  if (error) {
    return { status: 500, body: { error: (error as { message: string }).message } };
  }
  return { status: 201, body: { child: data } };
}

async function fetchOwnChild(
  id: string,
  supabase: SupabaseLike,
  userId: string
): Promise<{
  child: Record<string, unknown> | null;
  errorResult?: ServiceResult;
}> {
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return { child: null, errorResult: { status: 404, body: { error: "Child not found" } } };
  }
  if (data.user_id !== userId) {
    return { child: null, errorResult: { status: 403, body: { error: "Forbidden" } } };
  }
  return { child: data };
}

export async function getChild(
  id: string,
  supabase: SupabaseLike
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const { child, errorResult } = await fetchOwnChild(id, supabase, userId);
  if (errorResult) return errorResult;

  return { status: 200, body: { child } };
}

export async function updateChild(
  id: string,
  supabase: SupabaseLike,
  input: unknown
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const { errorResult } = await fetchOwnChild(id, supabase, userId);
  if (errorResult) return errorResult;

  const parsed = updateChildSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 400, body: { error: parsed.error.issues[0].message } };
  }

  const { data, error } = await supabase
    .from("children")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { status: 500, body: { error: (error as { message: string }).message } };
  }
  return { status: 200, body: { child: data } };
}

export async function deleteChild(
  id: string,
  supabase: SupabaseLike
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const { errorResult } = await fetchOwnChild(id, supabase, userId);
  if (errorResult) return errorResult;

  const deleteQuery = supabase.from("children").delete().eq("id", id);
  const { error } = await (deleteQuery as unknown as Promise<{
    error: { message: string } | null;
  }>);

  if (error) {
    return { status: 500, body: { error: error.message } };
  }
  return { status: 204 };
}
