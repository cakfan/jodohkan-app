import { StreamChat } from "stream-chat";

async function main() {
  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;
  if (!apiKey || !apiSecret) {
    console.error("STREAM_API_KEY and STREAM_API_SECRET must be set");
    process.exit(1);
  }

  const client = StreamChat.getInstance(apiKey, apiSecret);

  console.log("Enabling quotes on 'messaging' channel type...");

  try {
    const data = await client.updateChannelType("messaging", {
      quotes: true,
    });
    const r = data as unknown as Record<string, unknown>;
    console.log("Quotes enabled!");
    console.log("quotes:", r.quotes);
  } catch (e) {
    console.error("Failed:", e);
    process.exit(1);
  }
}

main();
