import { NextResponse } from "next/server";
import { getApiDocs } from "@/lib/swagger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const spec = getApiDocs();
    return NextResponse.json(spec);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate OpenAPI spec" },
      { status: 500 }
    );
  }
}
