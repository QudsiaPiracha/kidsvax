import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getInsights } from "@/lib/services/insights";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createServerClient();
  const language = req.nextUrl.searchParams.get("lang") ?? "en";
  const result = await getInsights(id, supabase, language);
  if (!result.body) return new NextResponse(null, { status: result.status });
  return NextResponse.json(result.body, { status: result.status });
}
