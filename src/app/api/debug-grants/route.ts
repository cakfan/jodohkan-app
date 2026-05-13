// app/api/debug-grants/route.ts
import { debugChannelGrants } from "@/app/actions/stream";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const channelId = req.nextUrl.searchParams.get("id") ?? "";
    console.log("Debugging channel:", channelId);
    const result = await debugChannelGrants(channelId);
    console.log("Result:", JSON.stringify(result));
    return NextResponse.json(result);
  } catch (e) {
    console.error("Debug grants error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
