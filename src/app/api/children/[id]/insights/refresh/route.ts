import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { refreshInsights } from "@/lib/services/insights";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createServerClient();
  const body = await req.json().catch(() => ({}));
  const language = (body as Record<string, unknown>).language as string ?? "en";
  const result = await refreshInsights(id, supabase as any, language);
  if (!result.body) return new NextResponse(null, { status: result.status });
  return NextResponse.json(result.body, { status: result.status });
}
