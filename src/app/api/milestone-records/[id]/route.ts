import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { toggleMilestone } from "@/lib/services/milestones";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createServerClient();
  const body = await req.json();
  const result = await toggleMilestone(id, supabase, body);
  if (!result.body) return new NextResponse(null, { status: result.status });
  return NextResponse.json(result.body, { status: result.status });
}
