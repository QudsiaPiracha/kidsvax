import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import {
  getReminderPreferences,
  updateReminderPreferences,
} from "@/lib/services/reminders";

export async function GET(): Promise<NextResponse> {
  const supabase = await createServerClient();
  const result = await getReminderPreferences(supabase);
  if (!result.body) return new NextResponse(null, { status: result.status });
  return NextResponse.json(result.body, { status: result.status });
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const supabase = await createServerClient();
  const body = await req.json();
  const result = await updateReminderPreferences(supabase, body);
  if (!result.body) return new NextResponse(null, { status: result.status });
  return NextResponse.json(result.body, { status: result.status });
}
