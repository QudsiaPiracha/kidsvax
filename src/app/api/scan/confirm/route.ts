import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import {
  confirmScanVaccinations,
  confirmScanUExams,
} from "@/lib/services/scan";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createServerClient();
  const body = await req.json();

  const confirmType = body.confirm_type;
  let result;

  if (confirmType === "u_exam") {
    result = await confirmScanUExams(supabase, body);
  } else {
    result = await confirmScanVaccinations(supabase, body);
  }

  if (!result.body) return new NextResponse(null, { status: result.status });
  return NextResponse.json(result.body, { status: result.status });
}
