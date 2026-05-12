import { StreamChat } from "stream-chat";

let streamClient: StreamChat | null = null;

export function getStreamClient(): StreamChat {
  if (!streamClient) {
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;
    if (!apiKey || !apiSecret) {
      throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set");
    }
    streamClient = StreamChat.getInstance(apiKey, apiSecret, { timeout: 10000 });
  }
  return streamClient;
}
