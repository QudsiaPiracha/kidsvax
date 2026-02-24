import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import {
  createMeasurement,
  listMeasurements,
} from "@/lib/services/growth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createServerClient();
  const result = await listMeasurements(id, supabase);
  if (!result.body) return new NextResponse(null, { status: result.status });
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createServerClient();
  const body = await req.json();
  const result = await createMeasurement(id, supabase, body);
  if (!result.body) return new NextResponse(null, { status: result.status });
  return NextResponse.json(result.body, { status: result.status });
}
