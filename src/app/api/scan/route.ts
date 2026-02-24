import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { processScan } from "@/lib/services/scan";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createServerClient();
  const body = await req.json();
  const result = await processScan(supabase as any, body);
  if (!result.body) return new NextResponse(null, { status: result.status });
  return NextResponse.json(result.body, { status: result.status });
}
