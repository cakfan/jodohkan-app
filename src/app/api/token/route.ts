import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-server-session";
import { getStreamClient } from "@/lib/stream";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = getStreamClient();
    const userId = session.user.id;
    const name = session.user.name ?? userId;

    await client.upsertUsers([{ id: userId, name, role: "user" }]);

    const chatToken = client.createToken(userId);

    return NextResponse.json({
      chatToken,
      apiKey: process.env.STREAM_API_KEY!,
      userId,
      name,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
