import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { listChildren, createChild } from "@/lib/services/children";

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const supabase = await createServerClient();
  const result = await listChildren(supabase);
  if (!result.body) return new NextResponse(null, { status: result.status });
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createServerClient();
  const body = await req.json();
  const result = await createChild(supabase, body);
  if (!result.body) return new NextResponse(null, { status: result.status });
  return NextResponse.json(result.body, { status: result.status });
}
